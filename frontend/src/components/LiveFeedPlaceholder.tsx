export function LiveFeedPlaceholder() {
  return (
    <section className="panel">
      <div className="panel__head">
        <span className="micro">Cámara · visión</span>
        <span className="micro">OFFLINE</span>
      </div>
      <div className="panel__body">
        <div className="live__frame">
          <div className="live__tag">
            <span className="dot" />
            CAM-01 · SIN SEÑAL
          </div>
          <div className="live__scan" />
          <p className="live__hint">
            Feed del celular con computer vision.
            <br />
            Se conecta vía POST /api/vision/report
          </p>
        </div>
      </div>
    </section>
  );
}
