"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does GreenCommute calculate carbon emissions?",
    answer:
      "GreenCommute uses standard climate research per-kilometer emissions factors: single-occupancy driving averages ~0.171 kg CO₂/km, public transit averages ~0.060 kg CO₂/km, while cycling and walking produce 0 tailpipe emissions. We calculate total distance via OpenStreetMap/OSRM routing and compute your net carbon avoided compared to driving alone.",
  },
  {
    question: "What are Eco Points and how are they calculated?",
    answer:
      "You earn 100 Eco Points for every 1.0 kg of CO₂ avoided by choosing active or public transportation over solo driving. Eco Points serve as personal milestones to track your progress and unlock community badges!",
  },
  {
    question: "Do I need an account to compare commute options?",
    answer:
      "Anyone can view and plan commutes on GreenCommute! However, creating a free account allows you to log your completed trips, save your favorite routes, track your cumulative carbon savings over time, and unlock achievement badges.",
  },
  {
    question: "How accurate are the distance and time estimates?",
    answer:
      "Distance calculations are based on driving network geometries provided by OSRM and OpenStreetMap data. While walking, cycling, and transit durations are estimates that exclude live traffic or transit delays, they provide a reliable side-by-side comparison for daily decision-making.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-accordion-container">
      <div className="section-heading text-center">
        <span className="eyebrow">
          <HelpCircle size={14} className="text-emerald" /> FREQUENTLY ASKED QUESTIONS
        </span>
        <h2>Got questions? We&apos;ve got answers.</h2>
        <p>Learn more about how GreenCommute helps you make cleaner travel choices.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown size={20} className={`faq-arrow ${isOpen ? "rotated" : ""}`} />
              </button>
              {isOpen && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
