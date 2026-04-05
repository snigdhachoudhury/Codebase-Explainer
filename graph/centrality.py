import networkx as nx

def compute_centrality(graph):
    return {
        "in_degree": dict(graph.in_degree()),
        "out_degree": dict(graph.out_degree()),
        "pagerank": nx.pagerank(graph)
    }