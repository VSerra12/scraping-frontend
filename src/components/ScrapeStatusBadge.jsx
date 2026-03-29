import { Tooltip } from "./Tooltip";
import { timeAgo } from "../lib/api";

// ScrapeStatusBadge — solo retorna el span del estado
export function ScrapeStatusBadge({ lastScrape, isScraping }) {

  if (isScraping) {
    return <span className="scrape-badge scrape-badge--running">● En curso</span>;
  }
  if (!lastScrape) {
    return <span className="scrape-badge scrape-badge--never">Sin datos</span>;
  }
  if (lastScrape.success) {
    return (
      <Tooltip text={`${timeAgo(lastScrape.started_at)} · ${lastScrape.products_found} productos`}>
        <span className="scrape-badge scrape-badge--ok" >● OK</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip text={lastScrape.error_message || "Error desconocido"}>
      <span className="scrape-badge scrape-badge--error" style={{color: 'var(--error)'}}>● Error</span>
    </Tooltip>
  );
}