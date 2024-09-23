import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { IFCModel } from "../../components/IFCModel";

import "./index.css";

const Issue1Page = () => {
  const renderCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
      world.camera.controls.setLookAt(0, 10, -10, 0, 0, 0);
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());
      componentRef.current = components;
      setIs3dReady(true);

      return () => {
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
        const file = await fetch(
          "https://thatopen.github.io/engine_components/resources/small.ifc"
        );
        const data = await file.arrayBuffer();
        await ifcModelComp.loadIfc(data);
      }
    };
    if (is3dReady) {
      run();
    }
  }, [is3dReady]);

  return (
    <div className="three-d-page-container">
      <div>
        <h1>
          Issue 1 -{" "}
          <a
            href="https://github.com/ThatOpen/engine_components/issues/491"
            target="_blank"
            rel="noopener noreferrer"
          >
            link
          </a>
        </h1>
        <p>No release memory when switch another page</p>
      </div>
      <div ref={containerRef} className="canvas-container" />
    </div>
  );
};

export default Issue1Page;
