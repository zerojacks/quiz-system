import { Quiz } from '../types/quiz';

export const sampleQuizzes: Quiz[] = [
    {
        id: 1,
        title: "JavaScript 基础测试",
        description: "测试你的 JavaScript 基础知识",
        questions: [
            {
                id: 1,
                title: "什么是JavaScript中的'闭包'?",
                options: [
                    "一个函数和对其周围状态的引用的组合",
                    "一个用来关闭浏览器窗口的函数",
                    "JavaScript的一个内置对象",
                    "一个用来结束循环的语句"
                ],
                correctAnswer: 0,
                explanation: "闭包是一个函数和对其周围状态（词法环境）的引用的组合。"
            },
            // 添加更多题目...
        ]
    },
    // 添加更多测试...
];