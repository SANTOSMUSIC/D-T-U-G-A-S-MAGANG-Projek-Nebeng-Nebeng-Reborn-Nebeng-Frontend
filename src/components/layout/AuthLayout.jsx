import defaultIllustration from '../../assets/auth-illustration.png';

export default function AuthLayout({
  children,
  logo,
  brandName = 'Nebeng',
  title,
  subtitle,
  illustration = defaultIllustration,
  illustrationAlt = 'Ilustrasi layanan Nebeng',
}) {
  return (
    <main
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        bg-[#EBEBEB]
        px-4
        py-6
        sm:px-6
        md:px-8
        font-['Inter']
      "
    >
      {/* AUTH CARD */}
      <section
        className="
          w-full
          max-w-[1080px]
          bg-white
          rounded-[30px]
          p-3
          sm:p-4
          overflow-hidden
          flex
          flex-col
          md:flex-row
        "
      >
        {/* =========================
            ILLUSTRATION
        ========================== */}
        <div
          className="
            relative
            w-full
            md:w-1/2
            shrink-0
            min-h-[280px]
            sm:min-h-[340px]
            md:min-h-[500px]
          "
        >
          {/* ILLUSTRATION PANEL */}
          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-[18px]
              bg-[#EBEBEB]
            "
          >
            <img
              src={illustration}
              alt={illustrationAlt}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />
          </div>
        </div>

        {/* =========================
            FORM PANEL
        ========================== */}
        <div
          className="
            flex-1
            flex
            items-center
            justify-center
            px-5
            py-8
            sm:px-10
            sm:py-10
            md:px-12
            lg:px-16
          "
        >
          <div className="w-full max-w-[360px]">

            {/* HEADER */}
            <header
              className="
                flex
                flex-col
                items-center
                text-center
                mb-6
              "
            >
              {/* TITLE */}
              {title && (
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    mb-2
                  "
                >
                  {logo && (
                    <img
                      src={logo}
                      alt={brandName}
                      className="
                        w-[32px]
                        h-[32px]
                        object-contain
                        shrink-0
                      "
                    />
                  )}

                  <h1
                    className="
                      text-[21px]
                      leading-[1.2]
                      font-semibold
                      tracking-[-0.3px]
                      text-[#111111]
                    "
                  >
                    {title}
                  </h1>
                </div>
              )}

              {/* SUBTITLE */}
              {subtitle && (
                <p
                  className="
                    max-w-[300px]
                    text-[10px]
                    leading-[1.5]
                    font-normal
                    text-[#A3A3A3]
                  "
                >
                  {subtitle}
                </p>
              )}
            </header>

            {children}

          </div>
        </div>
      </section>
    </main>
  );
}