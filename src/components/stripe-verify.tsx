import { Button, Link } from "@payloadcms/ui";

// StripeVerify - Renders a button linking to the Stripe account verification page
export const StripeVerify = () => {
  return (
    <Link href={"/stripe-verify"}>
      <Button>Verify your account</Button>
    </Link>
  );
};
