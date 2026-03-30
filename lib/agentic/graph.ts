/**
 * Minimal "node + edge" graph runner (LangGraph-inspired, but lightweight).
 *
 * We use this to make the backend workflows explicit and readable:
 * - Agent 1: seed/extract -> write JSON artifacts
 * - Agent 2: load context -> LLM chat
 * - Agent 3: load context -> fetch news tool -> LLM summary
 *
 * This is intentionally simple:
 * - Directed edges
 * - Optional conditional routing
 * - State is a plain object
 *
 * NOTE: This is not a full scheduler/queue. For now it runs in-process per request.
 */

export type GraphNode<S> = (state: S) => Promise<Partial<S> | void> | Partial<S> | void
export type NextNodeFn<S> = (state: S) => string

export class AgentGraph<S extends Record<string, any>> {
  private nodes = new Map<string, GraphNode<S>>()
  private edges = new Map<string, string>()
  private conditionalEdges = new Map<string, NextNodeFn<S>>()
  private startNode: string | null = null

  addNode(name: string, fn: GraphNode<S>) {
    if (this.nodes.has(name)) throw new Error(`Node already exists: ${name}`)
    this.nodes.set(name, fn)
    return this
  }

  setStart(name: string) {
    this.startNode = name
    return this
  }

  addEdge(from: string, to: string) {
    this.edges.set(from, to)
    return this
  }

  addConditionalEdge(from: string, next: NextNodeFn<S>) {
    this.conditionalEdges.set(from, next)
    return this
  }

  /**
   * Run the graph starting from `startNode` until no outgoing edge exists.
   *
   * For debuggability, we store a trace of visited nodes in state.__trace.
   */
  async run(initial: S): Promise<S> {
    if (!this.startNode) throw new Error("Graph start node not set")
    let state: S = { ...initial }
    const trace: string[] = Array.isArray((state as any).__trace) ? (state as any).__trace : []

    let current = this.startNode
    while (current) {
      trace.push(current)

      const fn = this.nodes.get(current)
      if (!fn) throw new Error(`Missing node implementation: ${current}`)

      const patch = await fn(state)
      if (patch && typeof patch === "object") {
        state = { ...state, ...patch }
      }

      // Choose next node.
      const conditional = this.conditionalEdges.get(current)
      if (conditional) {
        current = conditional(state)
        continue
      }

      current = this.edges.get(current) || ""
      if (!current) break
    }

    ;(state as any).__trace = trace
    return state
  }
}

