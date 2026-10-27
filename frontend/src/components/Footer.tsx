import Container from "./Container";

function Footer() {
  return (
    <footer className="mt-20 border-t">
      <Container className="py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="serif-italic text-2xl">E-Shop</p>

            <p className="mt-2 text-sm text-neutral-600">
              Everything you need, in one place.
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} E-Shop
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;