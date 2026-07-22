import './App.scss';

import {Component, createSignal, For, Show} from 'solid-js';
import {ifDefined} from "@hsedjame/optionjs";

const AUTHORIZE_FILE_TYPES = ["jpg", "jpeg", "png"]

type Image = {
    name: string,
    mimeType: string,
    data: string
}

const App: Component = () => {
    const [files, setFiles] = createSignal<File[]>([])
    const [images, setImages] = createSignal<Image[]>([])
    const [currentImageIdx, setCurrentImageIdx] = createSignal<number>()
    const [mimeTypeCopied, setMimeTypeCopied] = createSignal<boolean>(false)
    const [dataCopied, setDataCopied] = createSignal<boolean>(false)

    const currentImage = () => images()[currentImageIdx()!]
    // @ts-ignore
    let fileInputRef: HTMLInputElement = null;

    const handleFile = (e: Event) => {
        let fileList = ((e as InputEvent).target as HTMLInputElement).files;
        if (fileList) {

            let n = 0
            let file: File | null = fileList.item(n);

            while (file) {
                ifDefined<File>(file, (f) => {
                    setFiles([...files(), f])
                    f.bytes()
                        .then(bytes => {
                            let b = btoa(String.fromCharCode(...bytes))
                            let image = {
                                name: f.name,
                                mimeType: f.type,
                                data: b
                            };
                            setCurrentImageIdx(images().length)
                            setImages([...images(), image])
                        })
                })

                n++;
                file = fileList.item(n);
            }
        }
    }

    const copyMimeType = () => {
        navigator.clipboard.writeText(currentImage()!.mimeType)
            .then(r => {
                setMimeTypeCopied(true)
                setTimeout(() => setMimeTypeCopied(false), 500)
            })
    }

    const copyData = () => {
        navigator.clipboard.writeText(currentImage()!.data)
            .then(r => {
                setDataCopied(true)
                setTimeout(() => setDataCopied(false), 500)
            })
    }

    const removeFile = (e: Event, idx: number) => {
        e.stopPropagation();
        if (idx === currentImageIdx()) {
            if (images().length > 1) {
                setCurrentImageIdx(idx === 0 ? 1 : 0)
            } else {
                setCurrentImageIdx(undefined)
            }
        } else if (idx < currentImageIdx()!) {
            setCurrentImageIdx(currentImageIdx()! - 1)
        }
        setImages(images().filter((image, index) => index !== idx))
    }

    const FileUploader: Component<{ id: string }> = (props) => {
        return <>
            <input
                id={props.id}
                type="file"
                multiple={true}
                accept={AUTHORIZE_FILE_TYPES.map((ty) => `.${ty}`).join(",")}
                ref={fileInputRef}
                onChange={handleFile}
                textContent="Pick a file"
            />
        </>
    }

    return (
        <>
            <div class={"content"}>
                <div class={"title"}>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="24px"
                             fill="#2e9885">
                            <path
                                d="M520-170v-70h70v70h-70Zm-70-70v-170h70v170h-70Zm270-140v-100h70v100h-70Zm-70-100v-70h70v70h-70Zm-410 70v-70h70v70h-70Zm-70-70v-70h70v70h-70Zm310-240v-70h70v70h-70ZM198-608h154v-154H198v154Zm-28 28v-210h210v210H170Zm28 382h162v-154H198v154Zm-28 28v-210h218v210H170Zm438-438h154v-154H608v154Zm-28 28v-210h210v210H580Zm70 410v-140h-70v-70h140v140h70v70H650ZM520-410v-70h130v70H520Zm-140 0v-70h-70v-70h210v70h-70v70h-70Zm30-170v-140h70v70h70v70H410Zm-159-81v-48h48v48h-48Zm7 403v-48h48v48h-48Zm403-403v-48h48v48h-48Z"/>
                        </svg>
                    </div>
                    <div>
                        <span>IMAGE ENCODER </span>
                    </div>
                </div>
                <div class={"body"}>
                    <Show when={images().length === 0}
                          fallback={
                              <div class={"file-names"}>
                                  <For each={images()}>
                                      {(image, index) =>
                                          <div classList={{"file-name": true, "current": index() === currentImageIdx()}}
                                               on:click={() => setCurrentImageIdx(index())}>
                                              <span>{image.name}</span>
                                              <div class={"close-btn"} on:click={(e) => removeFile(e, index())}>
                                                  <svg xmlns="http://www.w3.org/2000/svg" height="24px"
                                                       viewBox="0 -960 960 960" width="24px" fill="#870101">
                                                      <path
                                                          d="m256-236-20-20 224-224-224-224 20-20 224 224 224-224 20 20-224 224 224 224-20 20-224-224-224 224Z"/>
                                                  </svg>
                                              </div>
                                          </div>
                                      }
                                  </For>
                                  <div>
                                      <label for={"file-upload-btn"} classList={{"file-name": true, "add-file": true}}>
                                          <span class="material-symbols-outlined">upload_file</span>
                                      </label>
                                      <FileUploader id={"file-upload-btn"}/>
                                  </div>

                              </div>
                          }
                    >
                        <div>
                            <label for="file-upload" class={"file-upload"}>
                                <span class="material-symbols-outlined">upload_file</span>
                                <span>UPLOAD AN IMAGE</span>
                            </label>
                            <FileUploader id={"file-upload"}/>
                        </div>
                    </Show>

                    {currentImage() && (
                        <>
                            <div class={"image-data"}>
                                <div class={"mime-type"}>
                                    <div  class={"att-title"}>
                                        <span>Mime Type</span>
                                        <Show when={!mimeTypeCopied()} fallback={<div class={"copied"}> copied </div>}>
                                            <span classList={{
                                                "material-symbols-outlined": true,
                                                "copy-icon": true
                                            }} on:click={copyMimeType}>content_copy</span>
                                        </Show>
                                    </div>

                                    <span class={"att-value"}>{currentImage()?.mimeType}</span>

                                </div>
                                <div class={"data"}>
                                    <div class={"att-title"}>
                                        <span>Data (base 64 encoded)</span>
                                        <Show when={!dataCopied()} fallback={<div class={"copied"}> copied </div>}>
                                 <span classList={{
                                     "material-symbols-outlined": true,
                                     "copy-icon": true
                                 }} on:click={copyData}>content_copy</span>
                                        </Show>
                                    </div>

                                    <div class={"data-value"}>{currentImage()?.data}</div>

                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>

        </>
    );
};

export default App;
