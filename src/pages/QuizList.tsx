import { Link } from 'react-router-dom';
import { sampleQuizzes } from '../data/quizData';

export const QuizList = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleQuizzes.map(quiz => (
                <div key={quiz.id} className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <Link
                        to={`/quiz/${quiz.id}`}
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        开始测试
                    </Link>
                </div>
            ))}
        </div>
    );
};