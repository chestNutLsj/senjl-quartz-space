 

# Preface

Rust has played, and keeps playing, a significant role in making systems programming more accessible. However, low-level concurrency topics such as atomics and memory ordering are still often thought of as somewhat mystical topics that are best left to a very small group of experts.

While working on Rust-based real-time control systems and the Rust standard library over the past few years, I found that many of the available resources on atomics and related topics only cover a small part of the information I was looking for. Many resources focus entirely on C and C++, which can make it hard to form the connection with Rust’s concept of (memory and thread) safety and type system. The resources that cover the details of the abstract theory, like C++’s memory model, often only vaguely explain how it relates to actual hardware, if at all. There are many resources that cover every detail of the actual hardware, such as processor instructions and cache coherency, but forming a holistic understanding often requires collecting bits and pieces of information from many different places.

This book is an attempt to put relevant information in one place, connecting it all together, providing everything you need to build your own correct, safe, and ergonomic concurrency primitives, while understanding enough about the underlying hardware and the role of the operating system to be able to make design decisions and basic optimization trade-offs.

# Who This Book is For

The primary audience for this book is Rust developers who want to learn more about low-level concurrency. Additionally, this book can also be suitable for those who are not very familiar with Rust yet, but would like to know what low-level concurrency looks like from a Rust perspective.

It is assumed you know the basics of Rust, have a recent Rust compiler installed, and know how to compile and run Rust code using `cargo`. Rust concepts that are important for concurrency are briefly explained when relevant, so no prior knowledge about Rust concurrency is necessary.

# Overview of the Chapters

This book consists of ten chapters. Here’s what to expect from each chapter, and what to look forward to:

[Chapter 1 — Basics of Rust Concurrency](ch01.xhtml#basics)

This chapter introduces all the tools and concepts we need for basic concurrency in Rust, such as threads, mutexes, thread safety, shared and exclusive references, interior mutability, and so on, which are foundational to the rest of the book.

For experienced Rust programmers who are familiar with these concepts, this chapter can serve as a quick refresher. For those who know these concepts from other languages but aren’t very familiar with Rust yet, this chapter will quickly fill you in on any Rust-specific knowledge you might need for the rest of the book.

[Chapter 2 — Atomics](ch02.xhtml#atomics)

In the second chapter we’ll learn about Rust’s atomic types and all their operations. We start with simple load and store operations, and build our way up to more advanced _compare-and-exchange loops_, exploring each new concept with several real world use cases as usable examples.

While _memory ordering_ is relevant for every atomic operation, that topic is left for the next chapter. This chapter only covers situations where _relaxed_ memory ordering suffices, which is the case more often than one might expect.

[Chapter 3 — Memory Ordering](ch03.xhtml#memory-ordering)

After learning about the various atomic operations and how to use them, the third chapter introduces the most complicated topic of the book: memory ordering.

We’ll explore how the memory model works, what a _happens-before relationship_ is and how to create them, what all the different memory orderings mean, and why _sequentially consistent ordering_ might not be the answer to everything.

[Chapter 4 — Building Our Own Spin Lock](ch04.xhtml#building-spinlock)

After learning the theory, we put it to practice in the next three chapters by building our own versions of several common concurrency primitives. The first of these chapters is a short one, in which we implement a _spin lock_.

We’ll start with a very minimal version to put _release and acquire memory ordering_ to practice, and then we’ll explore Rust’s concept of _safety_ to turn it into an ergonomic and hard-to-misuse Rust data type.

[Chapter 5 — Building Our Own Channels](ch05.xhtml#building-channels)

In chapter five, we’ll implement from scratch a handful of variations of a _one-shot channel_, a primitive that can be used to send data from one thread to another.

Starting with a very minimal but entirely `unsafe` version, we’ll work our way through several ways to design a _safe_ interface, while considering design decisions and their consequences.

[Chapter 6 — Building Our Own “Arc”](ch06.xhtml#building-arc)

For the sixth chapter, we’ll take on a more challenging memory ordering puzzle. We’re going to implement our own version of atomic reference counting from scratch.

After adding support for _weak pointers_ and optimizing it for performance, our final version will be practically identical to Rust’s standard `std::sync::Arc` type.

[Chapter 7 — Understanding the Processor](ch07.xhtml#hardware)

The seventh chapter is a deep dive into all the low level details. We’ll explore what happens at the processor level, what the _assembly instructions_ behind the atomic operations look like on the two most popular processor architectures, what caching is and how it affects the performance of our code, and we’ll find out to what remains of the memory model at the hardware level.

[Chapter 8 — Operating System Primitives](ch08.xhtml#os-primitives)

In chapter eight we acknowledge that there are things we can’t do without help of the operating system’s _kernel_, and learn what functionality is available on Linux, macOS, and Windows.

We’ll discuss the concurrency primitives that are available through _pthreads_ on POSIX systems, find out what we can do with the Windows API, and learn what the Linux _futex syscall_ does.

[Chapter 9 — Building Our Own Locks](ch09.xhtml#building-locks)

Using what we’ve learned in the previous chapters, in chapter nine we’re going to build several implementations of a _mutex_, _condition variable_, and _reader-writer lock_ from scratch.

For each of these, we’ll start with a minimal but complete version, which we’ll then attempt to optimize in various ways. Using some simple benchmark tests, we’ll find out that our attempts at optimization don’t always increase performance, while we discuss various design trade offs.

[Chapter 10 — Ideas and Inspiration](ch10.xhtml#inspiration)

The final chapter makes sure you don’t fall into a void after finishing the book, but are instead left with ideas and inspiration for things to build and explore with your new knowledge and skills, perhaps kicking off an exciting journey further into the depths of low-level concurrency.

# Conventions Used in This Book

The following typographical conventions are used in this book:

_Italic_

Used for new terms, URLs, and emphasis.

`Constant width`

Used for program listings, as well as within paragraphs to refer to program elements such as variable or function names, data types, statements, and keywords.

###### Tip

This element signifies a tip or suggestion.

###### Note

This element signifies a general note.

###### Warning

This element indicates a warning or caution.

# Using Code Examples

All code in this book is written for and tested using Rust 1.66.0, which was released on December 15th, 2022. Earlier versions do not include all features used in this book. Later versions, however, should work just fine.

For brevity, the code examples do not include `use` statements, except for the first time a new item from the standard library is introduced. As a convenience, the following prelude can be used to import everything necessary to compile any of the code examples in this book.

```
#[allow(unused)]
```

Supplemental material, including complete versions of all code examples, is available at [_https://marabos.nl/atomics/_](https://marabos.nl/atomics/).

You may use all example code offered with this book for any purpose.

If you have a technical question or a problem using the code examples, please send email to [_bookquestions@oreilly.com_](mailto:bookquestions@oreilly.com).

This book is here to help you get your job done. In general, if example code is offered with this book, you may use it in your programs and documentation. You do not need to contact us for permission unless you’re reproducing a significant portion of the code. For example, writing a program that uses several chunks of code from this book does not require permission. Selling or distributing examples from O’Reilly books does require permission. Answering a question by citing this book and quoting example code does not require permission. Incorporating a significant amount of example code from this book into your product’s documentation does require permission.

We appreciate, but generally do not require, attribution. An attribution usually includes the title, author, publisher, and ISBN. For example: “_Rust Atomics and Locks_ by Mara Bos (O’Reilly). Copyright 2023 Mara Bos, 978-1-098-11944-7.”

If you feel your use of code examples falls outside fair use or the permission given above, feel free to contact us at [_permissions@oreilly.com_](mailto:permissions@oreilly.com).

# O’Reilly Online Learning

###### Note

For more than 40 years, [_O’Reilly Media_](https://oreilly.com) has provided technology and business training, knowledge, and insight to help companies succeed.

Our unique network of experts and innovators share their knowledge and expertise through books, articles, and our online learning platform. O’Reilly’s online learning platform gives you on-demand access to live training courses, in-depth learning paths, interactive coding environments, and a vast collection of text and video from O’Reilly and 200+ other publishers. For more information, visit [_https://oreilly.com_](https://oreilly.com).

# How to Contact Us

Please address comments and questions concerning this book to the publisher:

- O’Reilly Media, Inc.
- 1005 Gravenstein Highway North
- Sebastopol, CA 95472
- 800-998-9938 (in the United States or Canada)
- 707-829-0515 (international or local)
- 707-829-0104 (fax)

We have a web page for this book, where we list errata, examples, and any additional information. You can access this page at [_https://oreil.ly/rust-atomics-and-locks_](https://oreil.ly/rust-atomics-and-locks).

Email [_bookquestions@oreilly.com_](mailto:bookquestions@oreilly.com) to comment or ask technical questions about this book.

For news and information about our books and courses, visit [_https://oreilly.com_](https://oreilly.com).

Find us on LinkedIn: [_https://linkedin.com/company/oreilly-media_](https://linkedin.com/company/oreilly-media).

Follow us on Twitter: [_https://twitter.com/oreillymedia_](https://twitter.com/oreillymedia).

Follow the author on Twitter: [_https://twitter.com/m_ou_se_](https://twitter.com/m_ou_se).

Watch us on YouTube: [_https://youtube.com/oreillymedia_](https://youtube.com/oreillymedia).

# Acknowledgments

I’d like to thank everyone who had a part in the creation this book. Many people provided support and useful input, which has been incredibly helpful. In particular, I’d like to thank Amanieu d’Antras, Aria Beingessner, Paul McKenney, Carol Nichols, and Miguel Raz Guzmán Macedo for their invaluable and thoughtful feedback on the early drafts. I’d also like to thank everyone at O’Reilly, and in particular my editors, Shira Evans and Zan McQuade, for their inexhaustible enthusiasm and support.