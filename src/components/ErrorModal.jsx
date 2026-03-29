import { timeAgo } from "../lib/api";

export function ErrorModal({ stores, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Tiendas con error</h2>

        {stores.map((s) => (
          <div key={s.store_id}>
            <p className="store-name">{s.store_name}</p>
            <p className="last-scraped">{timeAgo(s.last_scraped.started_at)}</p>
            <p className="store-error">{s.last_scraped.error_message}</p>
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}