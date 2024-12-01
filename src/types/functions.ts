export interface DatabaseFunctions {
  array_to_halfvec: {
    Args: {
      "": string;
    };
    Returns: unknown;
  };
  halfvec_avg: {
    Args: {
      "": number[];
    };
    Returns: unknown;
  };
  halfvec_out: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  halfvec_send: {
    Args: {
      "": unknown;
    };
    Returns: string;
  };
  halfvec_typmod_in: {
    Args: {
      "": unknown[];
    };
    Returns: number;
  };
  hnsw_bit_support: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  hnsw_halfvec_support: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  hnsw_sparsevec_support: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  hnswhandler: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  ivfflat_bit_support: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  ivfflat_halfvec_support: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  ivfflathandler: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  l2_norm: {
    Args: {
      "": unknown;
    };
    Returns: number;
  };
  l2_normalize: {
    Args: {
      "": string;
    };
    Returns: string;
  };
  sparsevec_out: {
    Args: {
      "": unknown;
    };
    Returns: unknown;
  };
  sparsevec_send: {
    Args: {
      "": unknown;
    };
    Returns: string;
  };
  sparsevec_typmod_in: {
    Args: {
      "": unknown[];
    };
    Returns: number;
  };
  vector_avg: {
    Args: {
      "": number[];
    };
    Returns: string;
  };
  vector_dims: {
    Args: {
      "": string;
    };
    Returns: number;
  };
  vector_norm: {
    Args: {
      "": string;
    };
    Returns: number;
  };
  vector_out: {
    Args: {
      "": string;
    };
    Returns: unknown;
  };
  vector_send: {
    Args: {
      "": string;
    };
    Returns: string;
  };
  vector_typmod_in: {
    Args: {
      "": unknown[];
    };
    Returns: number;
  };
}
