const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const languages = ['python', 'javascript', 'java', 'cpp', 'typescript'];
const tags = ['algorithm', 'data-structure', 'web', 'backend', 'frontend', 'database', 'security', 'testing'];

// Define language-specific code templates
const codeExamples = {
    python: [
        {
            title: "Simple List Comprehension",
            code: `numbers = [1, 2, 3, 4, 5]
squares = [x * x for x in numbers]
print(squares)  # Output: [1, 4, 9, 16, 25]`
        },
        {
            title: "Basic Calculator",
            code: `def calculator(a, b, operation):
    if operation == '+':
        return a + b
    elif operation == '-':
        return a - b
    elif operation == '*':
        return a * b
    elif operation == '/':
        return a / b if b != 0 else "Error: Division by zero"
    
print(calculator(10, 5, '+'))  # Output: 15`
        },
        {
            title: "File Reader",
            code: `def read_file(filename):
    try:
        with open(filename, 'r') as file:
            return file.read()
    except FileNotFoundError:
        return "File not found"
    except Exception as e:
        return f"Error: {str(e)}"`
        }
    ],

    javascript: [
        {
            title: "Array Filter",
            code: `const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers); // Output: [2, 4, 6]`
        },
        {
            title: "Promise Example",
            code: `function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
    console.log('Starting...');
    await delay(1000);
    console.log('One second has passed!');
}`
        },
        {
            title: "DOM Manipulator",
            code: `function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 
            element.style.display === 'none' ? 'block' : 'none';
    }
}`
        }
    ],

    java: [
        {
            title: "ArrayList Operations",
            code: `import java.util.ArrayList;

public class ListExample {
    public static void main(String[] args) {
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        
        System.out.println(fruits);
        fruits.remove("Banana");
        System.out.println(fruits);
    }
}`
        },
        {
            title: "String Reversal",
            code: `public class StringReverser {
    public static String reverse(String input) {
        StringBuilder reversed = new StringBuilder();
        for (int i = input.length() - 1; i >= 0; i--) {
            reversed.append(input.charAt(i));
        }
        return reversed.toString();
    }
}`
        }
    ],

    cpp: [
        {
            title: "Vector Sort",
            code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9};
    std::sort(numbers.begin(), numbers.end());
    
    for(int num : numbers) {
        std::cout << num << " ";
    }
    return 0;
}`
        },
        {
            title: "Simple Class",
            code: `#include <string>

class Person {
private:
    std::string name;
    int age;

public:
    Person(std::string n, int a) : name(n), age(a) {}
    
    void birthday() {
        age++;
    }
    
    int getAge() const {
        return age;
    }
};`
        }
    ],

    typescript: [
        {
            title: "Interface Example",
            code: `interface User {
    id: number;
    name: string;
    email: string;
}

function printUser(user: User): void {
    console.log(\`\${user.name} (\${user.email})\`);
}`
        },
        {
            title: "Generic Function",
            code: `function firstElement<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

const numbers = [1, 2, 3];
const first = firstElement(numbers); // type: number | undefined`
        },
        {
            title: "Type Guards",
            code: `type Square = {
    kind: "square";
    size: number;
};

type Circle = {
    kind: "circle";
    radius: number;
};

type Shape = Square | Circle;

function getArea(shape: Shape): number {
    if (shape.kind === "square") {
        return shape.size * shape.size;
    } else {
        return Math.PI * shape.radius * shape.radius;
    }
}`
        }
    ]
};

// Helper function to get random items from array
const getRandomItems = (arr, count = 1) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).join(', ');
};

// Helper function to get random date in the past year
const getRandomDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - Math.random());
    return date;
};

async function main() {
    try {
        // Create 20 users (plus admin from seed.js makes 21)
        const users = [];
        for (let i = 1; i <= 20; i++) {
            const hashedPassword = await bcrypt.hash(`password${i}`, 10);
            const user = await prisma.user.create({
                data: {
                    email: `user${i}@example.com`,
                    password: hashedPassword,
                    firstName: `FirstName${i}`,
                    lastName: `LastName${i}`,
                    phoneNumber: `+1${String(i).padStart(10, '0')}`,
                }
            });
            users.push(user);
        }

        // Create templates with real code examples
        const templates = [];
        let templateCount = 0;

        // Iterate through each language
        for (const language of Object.keys(codeExamples)) {
            const examples = codeExamples[language];

            // Create each example for this language
            for (const example of examples) {
                templateCount++;
                const template = await prisma.codeTemplate.create({
                    data: {
                        title: example.title,
                        description: `A practical example of ${example.title.toLowerCase()} in ${language}`,
                        code: example.code,
                        language: language,
                        tags: getRandomItems(tags, 3),
                        authorId: users[Math.floor(Math.random() * users.length)].id,
                        createdAt: getRandomDate(),
                    }
                });
                templates.push(template);
            }
        }

        // Fill remaining templates with variations if needed
        while (templateCount < 30) {
            const randomLang = Object.keys(codeExamples)[Math.floor(Math.random() * Object.keys(codeExamples).length)];
            const randomExample = codeExamples[randomLang][Math.floor(Math.random() * codeExamples[randomLang].length)];

            const template = await prisma.codeTemplate.create({
                data: {
                    title: `${randomExample.title} (Variation ${templateCount})`,
                    description: `A variation of ${randomExample.title.toLowerCase()} in ${randomLang}`,
                    code: randomExample.code,
                    language: randomLang,
                    tags: getRandomItems(tags, 3),
                    authorId: users[Math.floor(Math.random() * users.length)].id,
                    createdAt: getRandomDate(),
                }
            });
            templates.push(template);
            templateCount++;
        }

        // Create 35 blog posts
        const blogPosts = [];
        for (let i = 1; i <= 35; i++) {
            const selectedTemplates = templates
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3) + 1);

            const templateReferences = selectedTemplates
                .map(template => `[${template.title}](/editor?templateId=${template.id})`)
                .join('\n\n');

            const post = await prisma.blogPost.create({
                data: {
                    title: `Blog Post ${i}: Using Code Templates`,
                    content: `# Blog Post ${i}\n\nThis post demonstrates the usage of the following templates:\n\n${templateReferences}\n\nHere's how to use them effectively...`,
                    authorId: users[Math.floor(Math.random() * users.length)].id,
                    tags: getRandomItems(tags, 2),
                    createdAt: getRandomDate(),
                    templates: {
                        connect: selectedTemplates.map(template => ({ id: template.id }))
                    }
                }
            });
            blogPosts.push(post);
        }

        // Create 40 comments
        for (let i = 1; i <= 40; i++) {
            const isReply = Math.random() > 0.7;
            const parentComment = isReply ?
                await prisma.comment.findFirst({
                    where: { parentId: null },
                    orderBy: { createdAt: 'desc' }
                }) : null;

            await prisma.comment.create({
                data: {
                    content: `Comment ${i}: ${isReply ? 'Reply to previous comment.' : 'Great post! Very helpful information.'}`,
                    authorId: users[Math.floor(Math.random() * users.length)].id,
                    blogPostId: blogPosts[Math.floor(Math.random() * blogPosts.length)].id,
                    parentId: parentComment?.id || null,
                    createdAt: getRandomDate(),
                }
            });
        }

        console.log('Database populated successfully!');
    } catch (error) {
        console.error('Error populating database:', error);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });