export const snippetService = {
  saveSnippet: async (snippet) => {
    try {
      const snippets = await snippetService.getSnippets();
      snippets.push({
        ...snippet,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        // Add DSA-specific metadata
        category: snippet.category || 'general', // e.g., 'array', 'tree', 'graph', 'sorting', etc.
        timeComplexity: snippet.timeComplexity || 'N/A', // e.g., O(n), O(log n), etc.
        spaceComplexity: snippet.spaceComplexity || 'N/A',
        algorithm: snippet.algorithm || 'N/A' // e.g., 'binary search', 'quicksort', etc.
      });
      localStorage.setItem('dsaSnippets', JSON.stringify(snippets));
      return true;
    } catch (error) {
      console.error('Error saving DSA snippet:', error);
      return false;
    }
  },

  getSnippets: async () => {
    try {
      const snippets = localStorage.getItem('dsaSnippets');
      return snippets ? JSON.parse(snippets) : [];
    } catch (error) {
      console.error('Error getting DSA snippets:', error);
      return [];
    }
  },

  // Get snippets by DSA category
  getSnippetsByCategory: async (category) => {
    try {
      const snippets = await snippetService.getSnippets();
      return snippets.filter(snippet => snippet.category === category);
    } catch (error) {
      console.error('Error getting snippets by category:', error);
      return [];
    }
  },

  // Get snippets by algorithm type
  getSnippetsByAlgorithm: async (algorithm) => {
    try {
      const snippets = await snippetService.getSnippets();
      return snippets.filter(snippet => snippet.algorithm === algorithm);
    } catch (error) {
      console.error('Error getting snippets by algorithm:', error);
      return [];
    }
  },

  deleteSnippet: async (id) => {
    try {
      const snippets = await snippetService.getSnippets();
      const filteredSnippets = snippets.filter(snippet => snippet.id !== id);
      localStorage.setItem('dsaSnippets', JSON.stringify(filteredSnippets));
      return true;
    } catch (error) {
      console.error('Error deleting DSA snippet:', error);
      return false;
    }
  }
};