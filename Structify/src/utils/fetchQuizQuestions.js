export async function fetchQuizQuestions(week) {
  try {
    const response = await fetch(
      `https://structify.tech//api/quiz?week=${week}`
    );
    if (!response.ok) throw new Error("Failed to fetch quiz questions");
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    throw error;
  }
}
