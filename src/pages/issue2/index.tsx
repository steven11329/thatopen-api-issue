import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";

import "./index.css";
import { IFCModel } from "../../components/IFCModel";
import { Axes } from "../../components/Axes";

const Issue2Page = () => {
  const renderCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ifcModelCompRef = useRef<IFCModel | null>(null);
  const componentRef = useRef<OBC.Components | null>();
  const worldRef = useRef<OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  > | null>(null);
  const [is3dReady, setIs3dReady] = useState(false);

  useEffect(() => {
    //renderCountRef for avoid render twice when first load
    if (containerRef.current && renderCountRef.current > 0) {
      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBC.SimpleRenderer
      >();

      worldRef.current = world;
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
      world.camera = new OBC.OrthoPerspectiveCamera(components);

      const stats = new Stats();
      stats.showPanel(2);
      document.body.append(stats.dom);
      stats.dom.style.top = "0px";
      stats.dom.style.right = "0px";
      stats.dom.style.bottom = "unset";
      stats.dom.style.left = "unset";
      stats.dom.style.zIndex = "10";

      components.init();
      world.scene.setup();
      world.camera.controls.setLookAt(0, 100, 100, 0, 0, 0);
      new Axes(components, world.scene);
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());
      componentRef.current = components;
      setIs3dReady(true);

      return () => {
        setIs3dReady(false);
        if (componentRef.current) {
          componentRef.current = null;
        }
        if (worldRef.current) {
          worldRef.current = null;
        }
        components.dispose();
        document.body.removeChild(stats.dom);
      };
    }

    renderCountRef.current++;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (componentRef.current && worldRef.current) {
        const ifcModelComp = new IFCModel(
          componentRef.current,
          worldRef.current
        );
        await ifcModelComp.setup();
        ifcModelCompRef.current = ifcModelComp;
      }
    };
    if (is3dReady) {
      run();
    }

    return () => {
      if (is3dReady) {
        ifcModelCompRef.current = null;
      }
    };
  }, [is3dReady]);

  const handleOnSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of e.target.files) {
        const data = await file.arrayBuffer();
        await ifcModelCompRef.current?.loadIfc(data);
        const buildingSotreyInfoMap =
          await ifcModelCompRef.current?.getBuildingSotreyInfoMap();
        console.log(buildingSotreyInfoMap);
      }
    }
  };

  return (
    <div className="three-d-page-container">
      <div>
        <h1>
          Issue 2
          {/* -{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            link
          </a> */}
        </h1>
        <p>
          BoundingBoxer.addFragmentIdMap() is works on{" "}
          <a
            href="https://drive.google.com/file/d/1AUZ8XYBgsi2T4MgLbX0UQ0aJnQHG0EiO/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Simple Building
          </a>
          .
          <br />
          But it not works on Complex Building{" "}
          <a
            href="https://drive.google.com/file/d/1ZEOfpHaYUeVgbx7uhS0w6Wt9bTzY2qmd/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Complex Building
          </a>{" "}
          and FPS very low. (8 ~ 10)
        </p>
        <input type="file" accept=".ifc" onChange={handleOnSelectFile} />
      </div>
      <div ref={containerRef} className="canvas-container" />
    </div>
  );
};

export default Issue2Page;
