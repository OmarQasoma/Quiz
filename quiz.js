const apiURL = 'https://opentdb.com/api.php?amount=10&difficulty=easy';

const startButton = document.getElementById('fetch');
const questionsContainer = document.getElementById('questions');

const decodeHtml = (value) => {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = value;
    return decoder.value;
};

const shuffle = (values) => {
    const shuffledValues = [...values];

    for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledValues[index], shuffledValues[randomIndex]] = [
            shuffledValues[randomIndex],
            shuffledValues[index],
        ];
    }

    return shuffledValues;
};

const createQuestionElement = (question, index) => {
    const questionElement = document.createElement('article');
    const questionHeading = document.createElement('h2');
    const feedback = document.createElement('p');
    const options = shuffle([
        ...question.incorrect_answers,
        question.correct_answer,
    ]);

    questionHeading.textContent = `Question ${index + 1}: ${decodeHtml(question.question)}`;
    questionElement.appendChild(questionHeading);

    options.forEach((option) => {
        const optionElement = document.createElement('button');
        const decodedOption = decodeHtml(option);

        optionElement.type = 'button';
        optionElement.textContent = decodedOption;
        optionElement.addEventListener('click', () => {
            const isCorrect = option === question.correct_answer;

            questionElement.querySelectorAll('button').forEach((button) => {
                button.disabled = true;
            });

            feedback.textContent = isCorrect
                ? 'Correct!'
                : `Incorrect. The correct answer is ${decodeHtml(question.correct_answer)}.`;
            feedback.setAttribute('role', 'status');
        });

        questionElement.appendChild(optionElement);
    });

    questionElement.appendChild(feedback);
    return questionElement;
};

const createQuestions = (questions) => {
    const questionElements = questions.map(createQuestionElement);
    questionsContainer.replaceChildren(...questionElements);
};

startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    startButton.textContent = 'Loading...';
    questionsContainer.replaceChildren();

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`Quiz request failed with status ${response.status}.`);
        }

        const data = await response.json();
        if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
            throw new Error('The quiz service did not return any questions.');
        }

        createQuestions(data.results);
    } catch (error) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = error instanceof Error
            ? `Unable to load the quiz: ${error.message}`
            : 'Unable to load the quiz.';
        errorMessage.setAttribute('role', 'alert');
        questionsContainer.replaceChildren(errorMessage);
    } finally {
        startButton.disabled = false;
        startButton.textContent = 'Start';
    }
});
