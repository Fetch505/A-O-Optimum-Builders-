const MapSection: React.FC = () => {
  return (
    <section className="w-full  px-3 pt-12  flex flex-col gap-8">
      

        <div className="w-full flex items-center justify-center ">
          <div className="flex items-center gap-2 rounded-full px-3 py-1 border-2 border-gray-200 w-fit">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            <p className="text-md  tracking-wide text-gray-800">
              CONTACT US
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-center ">
          <p className="text-4xl md:text-5xl lg:text-6xl  font-FigtreeRegular text-[#101828]">Get in touch!</p>
        </div>
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
        <iframe
          className="w-full h-[25rem] border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d490.7199492054369!2d74.28737709805701!3d31.60951666987198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1755665098111!5m2!1sen!2s"
        ></iframe>
      </div>

    </section>
  );
};

export default MapSection;
