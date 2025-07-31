import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="bg-[#f7f6f0] pb-24 pt-5 sm:pb-32">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="mb-8 flex items-center justify-between">
            <Link
              className="flex items-center gap-1 font-[matter] text-2xl font-semibold"
              href="https://paper.design/"
              target="_blank"
            >
              <Logo />
            </Link>
            <Link href="https://github.com/paper-design/shaders" target="_blank">
              <GithubIcon className="size-7" />
            </Link>
          </div>
          <div className="mx-auto flex max-w-64 flex-col gap-2 text-center">
            <h1 className="font-[matter] text-4xl font-bold">Paper Shaders</h1>
            <p className="text-lg text-gray-600">ultra fast zero-dependency shaders for your designs</p>
          </div>
        </div>
      </header>
      <main className="-mt-12 pb-16">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="grid grid-cols-2 gap-6 gap-x-6 gap-y-8 sm:gap-16 sm:gap-x-16 md:grid-cols-3 md:gap-y-16">
            <ShaderItems />
          </div>
        </div>
      </main>
    </>
  );
}

function Logo() {
  return (
    <svg width="90" height="28" viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28.5133 22.0374V4.7446H34.5658C38.0985 4.7446 40.4207 6.84444 40.4207 10.0313C40.4207 13.2181 38.0985 15.3179 34.5658 15.3179H31.3296V22.0374H28.5133ZM31.3296 12.7487H34.5658C36.4433 12.7487 37.555 11.7112 37.555 10.0313C37.555 8.35142 36.4433 7.33856 34.5658 7.33856H31.3296V12.7487ZM40.2952 15.9849C40.2952 19.7151 42.6421 22.3091 46.0019 22.3091C47.7558 22.3091 49.2875 21.4939 50.0286 20.2093V22.0373H52.7214V9.90764H50.0286V11.6123C49.3616 10.4512 47.7558 9.63588 46.0019 9.63588C42.6421 9.63588 40.2952 12.2298 40.2952 15.9849ZM46.5453 19.8634C44.4702 19.8634 42.988 18.2577 42.988 15.9849C42.988 13.7121 44.4702 12.0816 46.5453 12.0816C48.6453 12.0816 50.1274 13.6874 50.1274 15.9849C50.1274 18.2577 48.6453 19.8634 46.5453 19.8634ZM54.9239 26.9782V9.90764H57.592V11.7604C58.3084 10.4759 59.8648 9.63588 61.6434 9.63588C65.0032 9.63588 67.3501 12.2298 67.3501 15.9602C67.3501 19.7151 65.0032 22.3091 61.6434 22.3091C59.8895 22.3091 58.2837 21.4939 57.592 20.3081V26.9782H54.9239ZM57.5179 15.9602C57.5179 18.2577 58.9754 19.8634 61.0752 19.8634C63.1751 19.8634 64.6326 18.2329 64.6326 15.9602C64.6326 13.6874 63.1751 12.0816 61.0752 12.0816C59.0001 12.0816 57.5179 13.6874 57.5179 15.9602ZM68.3923 15.9849C68.3923 19.641 70.9615 22.3091 74.593 22.3091C77.2272 22.3091 79.518 20.7634 80.2183 18.4545H77.4624C76.8523 19.3953 75.7992 19.9622 74.593 19.9622C72.6908 19.9622 71.332 18.7023 71.085 16.7013H80.1761C80.2255 16.4789 80.2502 16.1825 80.2502 15.7625C80.2502 11.9828 78.0515 9.63588 74.5436 9.63588C70.9862 9.63588 68.3923 12.2792 68.3923 15.9849ZM77.6316 14.725H71.1839C71.6038 13.045 72.8637 11.9581 74.5436 11.9581C76.2976 11.9581 77.4092 12.9956 77.6316 14.725ZM82.1148 9.90764V22.0373H84.783V15.8366C84.783 13.5145 85.9195 12.2545 88.0928 12.2545C88.7846 12.2545 89.4269 12.3781 89.921 12.5016V9.90764C89.4763 9.7347 88.8834 9.63588 88.2658 9.63588C86.6854 9.63588 85.4501 10.4512 84.783 11.9581V9.90764H82.1148Z"
        fill="black"
      />
      <path
        d="M13.619 3H3V6.14286H14L14 17L3 17V6.14286L0 6.14286V16.3794V25L3 25L14 25L14 17L22 17L22 6.14286V3H13.619Z"
        fill="black"
      />
    </svg>
  );
}
