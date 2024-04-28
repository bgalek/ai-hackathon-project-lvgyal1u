export const CardSkeleton = ({ questionIndex }: { questionIndex: number }) => {
    return (
        <li className="animate-pulse overflow-hidden bg-white px-4 py-4 shadow sm:rounded-md sm:px-6 space-y-4">
            <label className="block h-4 w-1/12 bg-slate-300 rounded"></label>
            <p className="h-3.5 w-full bg-slate-300 rounded"></p>
            <p className="h-3.5 w-3/4 bg-slate-300 rounded"></p>
            <fieldset className="group/fieldset" id={`question-${questionIndex}`} disabled>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input
                            id={`answer-${questionIndex}-1`}
                            name={`question-${questionIndex}`}
                            type="radio"
                            disabled
                            className={`peer/radio h-4 w-4 border-gray-300 text-slate-600 cursor-progress focus:ring-transparent`}
                        />
                        <label
                            htmlFor={`answer-${questionIndex}-1`}
                            className={`ml-3 block h-3.5 w-1/4 bg-slate-300 rounded cursor-progress`}
                        ></label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id={`answer-${questionIndex}-2`}
                            name={`question-${questionIndex}`}
                            type="radio"
                            disabled
                            className={`peer/radio h-4 w-4 border-gray-300 text-slate-600 cursor-progress focus:ring-transparent`}
                        />
                        <label
                            htmlFor={`answer-${questionIndex}-2`}
                            className={`ml-3 block h-3.5 w-2/12 bg-slate-300 rounded cursor-progress`}
                        ></label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id={`answer-${questionIndex}-3`}
                            name={`question-${questionIndex}`}
                            type="radio"
                            disabled
                            className={`peer/radio h-4 w-4 border-gray-300 text-slate-600 cursor-progress focus:ring-transparent`}
                        />
                        <label
                            htmlFor={`answer-${questionIndex}-3`}
                            className={`ml-3 block h-3.5 w-5/12 bg-slate-300 rounded cursor-progress`}
                        ></label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id={`answer-${questionIndex}-4`}
                            name={`question-${questionIndex}`}
                            type="radio"
                            disabled
                            className={`peer/radio h-4 w-4 border-gray-300 text-slate-600 cursor-progress focus:ring-transparent`}
                        />
                        <label
                            htmlFor={`answer-${questionIndex}-4`}
                            className={`ml-3 block h-3.5 w-1/5 bg-slate-300 rounded cursor-progress`}
                        ></label>
                    </div>
                </div>
            </fieldset>
        </li>
    );
};
