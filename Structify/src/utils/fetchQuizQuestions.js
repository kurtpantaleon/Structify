export const fetchQuizQuestions = async (week) => {
  try {
    const response = await fetch(`https://structify.tech/api/quiz/week${week}`);
    if (!response.ok) throw new Error("Failed to fetch quiz questions");
    const data = await response.json();

    // No need to filter, backend already returns correct week
    return { questions: data.questions || data };
  } catch (error) {
    throw error;
  }
};
