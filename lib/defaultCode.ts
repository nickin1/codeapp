export const DEFAULT_CODE: { [key: string]: string } = {
    python: `print("Hello, World!")
for i in range(5):
    print(f"Count: {i}")`,

    javascript: `console.log("Hello, World!");
for (let i = 0; i < 5; i++) {
    console.log(\`Count: \${i}\`);
}`,

    typescript: `function greet(name: string): void {
    console.log(\`Hello, \${name}!\`);
}
greet("World");`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    for(int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }
    return 0;
}`,

    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    for(int i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }
    return 0;
}`,

    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for(int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,

    rust: `fn main() {
    println!("Hello, World!");
    for i in 0..5 {
        println!("Count: {}", i);
    }
}`,

    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    for i := 0; i < 5; i++ {
        fmt.Printf("Count: %d\\n", i)
    }
}`,
    ruby: `puts "Hello, World!"
5.times do |i|
    puts "Count: #{i}"
end`,

    racket: `#lang racket

; Print a greeting
(displayln "Hello, World!")

; Count from 0 to 4
(for ([i (range 5)])
  (printf "Count: ~a\\n" i))

; Example of a function
(define (factorial n)
  (if (zero? n)
      1
      (* n (factorial (sub1 n)))))

(printf "Factorial of 5: ~a\\n" (factorial 5))`
};

export const getDefaultCode = (language: string): string => {
    return DEFAULT_CODE[language] || '// Start coding here';
}; 