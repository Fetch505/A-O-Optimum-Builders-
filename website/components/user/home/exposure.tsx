const Exposure = () => {
    return (
        <section className="w-full outerPadding flex flex-col justify-between">
            <div className="w-full rounded-3xl h-full p-4 md:p-8 lg:p-12">
                <div className="w-1/4 ">
                    <div className="rounded-full items-center justify-center px-3 py-1 border-2 border-gray-100 w-fit gap-2 flex">
                        {/* custom yellow dot */}
                        <span className="w-2 h-2 bg-gold rounded-full"></span>

                        <p className="text-md ">WHO WE ARE</p>
                    </div>
                </div>
                <div className="w-3/4 "></div>
            </div>
        </section>
    )
}

export default Exposure;
