// @refresh reload
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from "solid-start";
import { Header } from "~/components/Header";
import "~/root.css";
import { Provider } from "~/utils/keybinds";

export default function Root() {
  return (
    <Html lang="en" class="dark">
      <Head>
        <Title>TaskManager</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="flex flex-col relative w-screen min-h-screen h-auto dark:bg-black">
        <Suspense>
          <ErrorBoundary
            fallback={(e, reset) => (
              <div class="flex flex-col gap-4 items-center justify-center w-screen h-screen">
                {JSON.stringify(e)}
                <button onClick={reset}>Reset</button>
              </div>
            )}
          >
            <Provider>
              <Header />
              <div class="pt-14 container mx-auto">
                <Routes>
                  <FileRoutes />
                </Routes>
              </div>
            </Provider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
