const Exposure = () => {
    return (
        <section className="w-full outerPadding flex flex-col justify-between">
            <div className="w-full rounded-3xl h-full p-4 md:p-8 lg:p-12 flex flex-col md:flex-row gap-8">
                
                {/* Left pill label */}
                <div className="w-full md:w-1/4">
                    <div className="flex items-center gap-2 rounded-full px-3 py-1 border-2 border-gray-200 w-fit">
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <p className="text-sm font-medium tracking-wide text-gray-800">
                            WHO WE ARE
                        </p>
                    </div>
                </div>

                {/* Right content */}
                <div className="w-full md:w-3/4 flex flex-col gap-6">
                    
                    {/* Heading + paragraph */}
                    <div>
                        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed">
                            <span className="font-semibold text-gray-900">
                                At A&O Optimum Builders,
                            </span>{" "}
                            we specialize in{" "}
                            <span className="font-semibold text-gray-900">
                                residential and commercial construction
                            </span>
                            , delivering top-quality remodeling, custom homes,
                            concrete works, and repair projects that stand the
                            test of time. From elegant renovations to large-scale
                            builds, we bring reliability, craftsmanship, and
                            stress-free management to every project.
                        </p>

                        <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                            Our expert team transforms visions into reality—
                            bringing innovation, efficiency, and excellence to
                            every build
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold text-gray-900">4.9</h3>
                            <p className="text-sm text-amber-500 mt-1">Rate Agency</p>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold text-gray-900">20+</h3>
                            <p className="text-sm text-amber-500 mt-1">Total Projects</p>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold text-gray-900">50+ MILLION</h3>
                            <p className="text-sm text-amber-500 mt-1">Total Revenue Generated</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Exposure;
