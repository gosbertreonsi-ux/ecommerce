function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-bold">
              E-Shop
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Everything you need, in one place.
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} E-Shop
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;