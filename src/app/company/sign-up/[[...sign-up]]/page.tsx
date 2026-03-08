import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full z-0 opacity-50" />

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-3xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none bg-transparent border-none p-0",
              headerTitle: "text-2xl font-semibold tracking-tight",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              formFieldInput:
                "flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              formFieldLabel:
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              socialButtonsBlockButton:
                "inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background/50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full border border-input border-white/10 backdrop-blur-sm",
              socialButtonsBlockButtonText: "font-medium",
              footerActionLink: "text-primary hover:text-primary/90 font-medium",
            },
          }}
          routing="path"
          path="/company/sign-up"
          signInUrl="/company/sign-in"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
