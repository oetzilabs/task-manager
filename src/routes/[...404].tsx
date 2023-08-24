import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <div class="flex flex-col gap-10 w-screen h-screen items-center justify-center">
        <h1 class="text-7xl">Page Not Found</h1>
        <p class="text-3xl">
          Visit{" "}
          <A href="/" target="_blank" class="text-blue-600">
            the homepage
          </A>
          .
        </p>
      </div>
    </main>
  );
}
