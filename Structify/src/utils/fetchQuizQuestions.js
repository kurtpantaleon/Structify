export async function fetchQuizQuestions(week) {
  try {
    const response = await fetch(
      `http://146.190.80.179:5173/api/quiz?week=${week}`
    );
    if (!response.ok) throw new Error("Failed to fetch quiz questions");
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    throw error;
  }
}
