import React from 'react';
import Image from 'next/image';

export default function Welcomebanner() {
    return (
        <div className="flex items-center justify-between bg-[#018ABE] text-white px-12 py-4 mx-9 mt-4 rounded-xl h-44 shadow-md">
            {/* Text Content */}
            <div>
                <h2 className="text-3xl font-bold">Welcome Back, Prashant Patil !</h2>
                <p className="text-xl mt-1">
                    "You have more than 8 projects. Begin managing them!"
                </p>
            </div>

            {/* Image using Next.js <Image /> */}
            <div className="relative h-36 w-84 hidden sm:block">
                <Image
                    src="/dashboard/welcome.png"
                    alt="Welcome Banner Illustration"
                    width={1000}
                    height={1000}
                    sizes="112px"
                    className="object-contain h-full w-full"
                />
            </div>
        </div>
    );
}
