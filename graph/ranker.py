def get_file_scores(parsed_data):
    from dependency_graph import build_graph
    from centrality import compute_centrality

    G = build_graph(parsed_data)
    centrality = compute_centrality(G)

    ranked = sorted(
        centrality["pagerank"].items(),
        key=lambda x: x[1],
        reverse=True
    )

    return {
        "file_scores": [
            {"file": f, "importance": float(score)}
            for f, score in ranked
        ]
    }