import { CardSkeleton } from "@/components/CardSkeleton";

export default function Page() {
    return (
        <div className="relative isolate overflow-hidden bg-slate-100 py-24 sm:py-32">
            <div
                className="absolute -top-80 left-[max(6rem,33%)] -z-10 transform-gpu blur-3xl sm:left-1/2 md:top-20 lg:ml-20 xl:top-3 xl:ml-56"
                aria-hidden="true"
            >
                <div
                    className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
                    style={{
                        clipPath:
                            "polygon(63.1% 29.6%, 100% 17.2%, 76.7% 3.1%, 48.4% 0.1%, 44.6% 4.8%, 54.5% 25.4%, 59.8% 49.1%, 55.3% 57.9%, 44.5% 57.3%, 27.8% 48%, 35.1% 81.6%, 0% 97.8%, 39.3% 100%, 35.3% 81.5%, 97.2% 52.8%, 63.1% 29.6%)",
                    }}
                />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <ul role="list" className="space-y-3">
                    {Array(10).map((index) => (
                        <CardSkeleton key={index} questionIndex={index} />
                    ))}
                </ul>
            </div>
            {/* <div className="px-4 py-5 sm:p-6 flex justify-center">
        <button
            type="submit"
            onClick={() => location.reload()}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
            <ArrowPathIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Generuj nowy test
        </button>
    </div> */}
        </div>
    );
}
