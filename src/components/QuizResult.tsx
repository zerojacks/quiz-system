import React from 'react'
import { Quiz, UserAnswer } from '../types/quiz'

interface Props {
    quiz: Quiz;
    userAnswers: UserAnswer[];
    onRetry: () => void;
}

export const QuizResult: React.FC<Props> = ({ quiz, userAnswers, onRetry }) => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length
    const totalQuestions = quiz.questions.length
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">测试结果</h2>
            <div className="text-lg mb-4">
                得分: {score}% ({correctAnswers}/{totalQuestions})
            </div>
            <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                    const userAnswer = userAnswers[index]
                    return (
                        <div
                            key={question.id}
                            className={`p-4 border rounded ${userAnswer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                                }`}
                        >
                            <div className="font-medium">{question.title}</div>
                            <div className="mt-2">
                                你的答案: {question.options[userAnswer.selectedOption]}
                            </div>
                            {!userAnswer.isCorrect && (
                                <div className="mt-2 text-green-600">
                                    正确答案: {question.options[question.correctAnswer]}
                                </div>
                            )}
                            {question.explanation && (
                                <div className="mt-2 text-gray-600">
                                    解释: {question.explanation}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <button
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={onRetry}
            >
                重新测试
            </button>
        </div>
    )
}