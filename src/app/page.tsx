import { ClipboardArea, } from "@/components/ClipboardArea";
import { Form, } from "@/components/Form";
import { Header, } from "@/components/Header";
import { ItemsList, } from "@/components/ItemsList";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:h-screen min-h-screen ">
        <div className="flex flex-col justify-center lg:col-span-1 items-center lg:border-r-1 px-8 py-12 space-y-8">
          <Header />
          <Form />
        </div>
        <div className=" px-8 lg:col-span-2 py-12 space-y-8 overflow-y-scroll">
          <ItemsList />
          <ClipboardArea />
        </div>
      </div>
    </div>
  );
}
