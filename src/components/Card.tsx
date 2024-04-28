'use client'

import { Disclosure } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { MouseEventHandler, useState } from "react";

interface Card {
    questionIndex: number;
    question: string;
    answers: string[];
    correctAnswerIndex: number;
}

export const Card = ({ question, questionIndex, answers, correctAnswerIndex: correct }: Card) => {
    const [disabled, setDisabled] = useState(false);
    const [checked, setChecked] = useState("");

    const handleClick: MouseEventHandler<HTMLInputElement> = (event) => {
        const input = event.target as HTMLInputElement;

        setChecked(input.value);
        setDisabled(true);
    };

    return (
        <li className="overflow-hidden bg-white px-4 py-4 shadow sm:rounded-md sm:px-6  space-y-4">
            <Disclosure defaultOpen key={`question-${questionIndex}`}>
                {({ open }) => (
                    <>
                        <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900:">
                            <label className="text-base font-semibold text-gray-900">Pytanie {questionIndex + 1}</label>
                            <span className="ml-6 flex h-7 items-center">
                                {open ? (
                                    <ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
                                )}
                            </span>
                        </Disclosure.Button>
                        <Disclosure.Panel className="space-y-4 transition ease-in duration-300">
                            <p className="text-sm text-gray-500">{question}</p>
                            <fieldset className="group/fieldset" id={`question-${questionIndex}`} disabled={disabled}>
                                <div className="space-y-3">
                                    {answers.map((answer, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                onClick={handleClick}
                                                id={`answer-${questionIndex}-${index}`}
                                                name={`question-${questionIndex}`}
                                                type="radio"
                                                disabled={disabled}
                                                checked={answer === checked}
                                                value={answer}
                                                className={`peer/radio h-4 w-4 border-gray-300 text-slate-600 ${
                                                    correct === index
                                                        ? "checked:text-green-600"
                                                        : "checked:text-red-600"
                                                }  cursor-pointer group-disabled/fieldset:cursor-not-allowed focus:ring-transparent`}
                                            />
                                            <label
                                                htmlFor={`answer-${questionIndex}-${index}`}
                                                className={`ml-3 block text-sm font-medium leading-6  text-gray-500 ${
                                                    correct === index
                                                        ? "group-disabled/fieldset:text-green-600"
                                                        : "group-disabled/fieldset:text-gray-400"
                                                } ${
                                                    correct === index
                                                        ? "peer-checked/radio:text-green-600"
                                                        : "peer-checked/radio:text-red-600"
                                                } cursor-pointer group-disabled/fieldset:cursor-not-allowed`}
                                            >
                                                {answer}
                                            </label>
                                            {checked && correct === index && (
                                                <QuestionMarkCircleIcon
                                                    className={`ml-1 h-4 w-4`}
                                                ></QuestionMarkCircleIcon>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </li>
    );
};
