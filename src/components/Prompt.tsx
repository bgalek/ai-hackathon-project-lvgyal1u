"use client";
import { ArrowRightCircleIcon, PaperClipIcon } from "@heroicons/react/20/solid";
import { RedirectType, permanentRedirect, redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";

export const Prompt = () => {
    const [text, setText] = useState("");

    const handleSubmit = async (formData: FormData) => {
        const path = encodeURI(`cards?prompt=${formData.get("prompt") ?? text}`);

        permanentRedirect(path, RedirectType.replace);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };

    return (
        <form action={handleSubmit}>
            <div className="relative my-6 flex items-center">
                <input
                    type="text"
                    name="prompt"
                    minLength={3}
                    onChange={handleChange}
                    placeholder="Egzamin na prawo jazdy kategorii B..."
                    className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                    type="submit"
                    disabled={!text}
                    className="group/text absolute inset-y-0 right-0 flex py-1.5 pr-1.5 disabled:cursor-not-allowed"
                >
                    <ArrowRightCircleIcon className="h-6 w-6 text-indigo-700 group-disabled/text:text-gray-400 " />
                </button>
            </div>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">Albo</span>
                </div>
            </div>
            <button
                type="submit"
                className="group/file relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <PaperClipIcon className="h-12 w-12 mx-auto text-indigo-700 group-disabled/file:text-gray-400" />
                <span className="mt-2 block text-sm font-semibold text-gray-900">Wgraj plik</span>
            </button>
        </form>
    );
};
