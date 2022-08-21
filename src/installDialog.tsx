import { useEffect, useRef } from "preact/hooks";

export function InstallDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if ((window as any).chrome?.runtime?.sendMessage) {
      (window as any).chrome.runtime.sendMessage(
        "pfjfdpobjbkelgmnpgfncoigidcpdnik",
        {},
        (arg: any) => {
          if ((window as any).chrome.runtime.lastError) {
            console.log("no ext detected!");
            const dia = dialogRef.current;
            if (dia) {
              dia.showModal();
            }
          }
          console.log(arg);
        }
      );
    }
  });
  return (
    <dialog ref={dialogRef}>
      您没有安装插件，请{" "}
      <button
        onClick={async () => {
          if (!(window as any).showDirectoryPicker) {
            window.open(import.meta.env.BASE_URL + `ext.zip`);
            return;
          }
          const dirHandle = await (window as any).showDirectoryPicker({
            mode: "readwrite",
          });
          const dir = await dirHandle.getDirectoryHandle("ext", {
            create: true,
          });
          const files = ["manifest.json", "rules_1.json", "background.js"];
          await Promise.all(
            files.map((f) =>
              fetch(import.meta.env.BASE_URL + `ext/${f}`)
                .then((r) => r.text())
                .then(async (t) => {
                  const fh = await dir.getFileHandle(f, { create: true });
                  const writable = await fh.createWritable();
                  await writable.write(t);

                  // Close the file and write the contents to disk.
                  await writable.close();
                })
            )
          );
          console.log(1234);
          console.log(dirHandle, dir);
        }}
      >
        点击下载
      </button>
    </dialog>
  );
}
