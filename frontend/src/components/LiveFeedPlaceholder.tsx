export function LiveFeedPlaceholder() {
  return (
    <section className="panel">
      <div className="panel__head">
        <span className="panel__title">Cámara · visión</span>
        <span className="micro">Offline</span>
      </div>
      <div className="panel__body">
        <div className="live__frame">
          <div className="live__tag">
            <span className="dot" />
            CAM-01 · sin señal
          </div>
          <div className="live__scan" />
          <p className="live__hint">
            Feed del celular con computer vision.
            <br />
            Se conecta vía <code>POST /api/vision/report</code>
          </p>
        </div>
      </div>
    </section>
  );
}
