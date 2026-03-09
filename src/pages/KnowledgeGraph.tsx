import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";

const nodeColors: Record<string, string> = {
  core: "#6366f1",
  supporting: "#8b5cf6",
  detail: "#a78bfa",
  default: "#64748b",
};

export default function KnowledgeGraph() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(documentId || "");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (documentId) {
      setSelectedDoc(documentId);
    }
  }, [documentId]);

  const documentsQuery = useQuery({
    queryKey: ["documents-knowledge-graph", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title")
        .eq("user_id", user!.id)
        .eq("status", "ready")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const conceptsQuery = useQuery({
    queryKey: ["concepts", user?.id, documentId],
    queryFn: async () => {
      let query = supabase
        .from("concepts")
        .select("*")
        .eq("user_id", user!.id);
      if (documentId) query = query.eq("document_id", documentId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const relationshipsQuery = useQuery({
    queryKey: ["concept-relationships", user?.id, documentId],
    queryFn: async () => {
      const conceptIds = conceptsQuery.data?.map((c) => c.id) || [];
      if (conceptIds.length === 0) return [];
      const { data, error } = await supabase
        .from("concept_relationships")
        .select("*")
        .in("concept_a", conceptIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!conceptsQuery.data && conceptsQuery.data.length > 0,
  });

  // Build graph from data
  useEffect(() => {
    const concepts = conceptsQuery.data || [];
    const relationships = relationshipsQuery.data || [];

    const graphNodes: Node[] = concepts.map((c, i) => {
      const angle = (2 * Math.PI * i) / concepts.length;
      const radius = 300;
      return {
        id: c.id,
        position: { x: 400 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) },
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold text-sm">{c.name}</div>
              {c.category && <div className="text-xs opacity-70">{c.category}</div>}
            </div>
          ),
        },
        style: {
          background: nodeColors[c.category || "default"] || nodeColors.default,
          color: "white",
          border: "none",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "12px",
          boxShadow: `0 4px 12px ${nodeColors[c.category || "default"] || nodeColors.default}40`,
        },
      };
    });

    const graphEdges: Edge[] = relationships.map((r) => ({
      id: r.id,
      source: r.concept_a,
      target: r.concept_b,
      label: r.relationship_type || "",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: Math.max(1, (r.strength || 0.5) * 3) },
      labelStyle: { fontSize: 10, fill: "#94a3b8" },
    }));

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [conceptsQuery.data, relationshipsQuery.data, setNodes, setEdges]);

  const handleExtract = async () => {
    if (!selectedDoc) {
      toast.error("Select a document first");
      return;
    }
    setExtracting(true);
    try {
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .select("id, status")
        .eq("id", selectedDoc)
        .eq("user_id", user!.id)
        .single();
      if (documentError) throw documentError;
      if (document.status !== "ready") {
        throw new Error("Document indexing is still in progress. Please wait until processing finishes.");
      }

      const res = await supabase.functions.invoke("extract-concepts", {
        body: { documentId: document.id },
      });
      if (res.error) throw res.error;

      const extractedConcepts = Array.isArray(res.data?.concepts) ? res.data.concepts : [];
      const extractedRelationships = Array.isArray(res.data?.relationships)
        ? res.data.relationships
        : [];
      if (extractedConcepts.length === 0) {
        throw new Error("No concepts were extracted from this document.");
      }

      const existingConceptIds = conceptsQuery.data?.map((concept) => concept.id) || [];
      if (existingConceptIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("concepts")
          .delete()
          .in("id", existingConceptIds);
        if (deleteError) throw deleteError;
      }

      const { data: savedConcepts, error: insertConceptsError } = await supabase
        .from("concepts")
        .insert(
          extractedConcepts.map((concept: {
            name: string;
            definition?: string;
            category?: string;
            importanceScore?: number;
          }) => ({
            user_id: user!.id,
            document_id: selectedDoc,
            name: concept.name,
            definition: concept.definition ?? null,
            category: concept.category ?? null,
            importance_score: concept.importanceScore ?? null,
          }))
        )
        .select("*");
      if (insertConceptsError) throw insertConceptsError;

      const conceptMap = new Map(
        savedConcepts.map((concept) => [concept.name.trim().toLowerCase(), concept.id])
      );
      const relationshipRows = extractedRelationships
        .map((relationship: {
          from: string;
          to: string;
          type?: string;
          strength?: number;
        }) => ({
          concept_a: conceptMap.get(relationship.from.trim().toLowerCase()) ?? null,
          concept_b: conceptMap.get(relationship.to.trim().toLowerCase()) ?? null,
          relationship_type: relationship.type ?? null,
          strength: relationship.strength ?? 0.5,
        }))
        .filter((relationship) => relationship.concept_a && relationship.concept_b)
        .filter((relationship) => relationship.concept_a !== relationship.concept_b);

      if (relationshipRows.length > 0) {
        const { error: insertRelationshipsError } = await supabase
          .from("concept_relationships")
          .insert(
            relationshipRows.map((relationship) => ({
              concept_a: relationship.concept_a!,
              concept_b: relationship.concept_b!,
              relationship_type: relationship.relationship_type,
              strength: relationship.strength,
            }))
          );
        if (insertRelationshipsError) throw insertRelationshipsError;
      }

      conceptsQuery.refetch();
      relationshipsQuery.refetch();
      toast.success("Concepts extracted!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to extract concepts";
      toast.error(message);
    } finally {
      setExtracting(false);
    }
  };

  const isLoading = conceptsQuery.isLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Knowledge Graph</span>
          <div className="ml-auto flex items-center gap-3">
            {!documentId && (
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
              >
                <option value="">Select a document...</option>
                {documentsQuery.data?.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            )}
            <Button size="sm" onClick={handleExtract} disabled={extracting || !selectedDoc}>
              {extracting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</>
              ) : (
                "Extract Concepts"
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <Maximize2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No concepts yet</h3>
              <p className="text-sm text-text-muted mb-4">
                Extract concepts from a document to build your knowledge graph
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-4rem)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#334155" gap={20} />
              <Controls />
              <MiniMap
                nodeStrokeColor="#6366f1"
                nodeColor="#1e293b"
                maskColor="rgba(0,0,0,0.7)"
              />
            </ReactFlow>
          </div>
        )}
      </main>
    </div>
  );
}
