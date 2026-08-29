import { useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { GeoEvent } from "../../types/domain";
import { Badge } from "../../components/ui/badge";
import { formatDate, pct } from "../../lib/utils";
import { Field, Input, Select } from "../../components/ui/forms";
import { ClassificationBadge, unavailable } from "../../components/ui/classification";

const markerIcon = L.divIcon({
  className: "",
  html: "<span style=\"display:block;width:16px;height:16px;border-radius:50%;background:#4fb3d8;border:2px solid #e7edf4;box-shadow:0 0 0 4px rgba(79,179,216,.18)\"></span>",
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export function IntelligenceMap({ events }: { events: GeoEvent[] }) {
  const [eventType, setEventType] = useState("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const filteredEvents = useMemo(
    () => events.filter((event) => (eventType === "all" || event.event_type === eventType) && event.confidence >= minConfidence / 100),
    [eventType, events, minConfidence]
  );
  const eventTypes = useMemo(() => Array.from(new Set(events.map((event) => event.event_type))).sort(), [events]);
  const center: [number, number] = filteredEvents.length ? [filteredEvents[0].latitude, filteredEvents[0].longitude] : [40.7128, -74.006];
  const path = filteredEvents.map<[number, number]>((event) => [event.latitude, event.longitude]);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 rounded-lg border border-border bg-white/[0.02] p-3 md:grid-cols-[1fr_1fr_1fr_160px]">
        <Field label="Case"><Select disabled><option>Current case</option></Select></Field>
        <Field label="Event type">
          <Select value={eventType} onChange={(event) => setEventType(event.target.value)}>
            <option value="all">All events</option>
            {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </Select>
        </Field>
        <Field label="Date range"><Input type="date" /></Field>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Confidence {minConfidence}%
          <input aria-label="Map confidence filter" type="range" min={0} max={100} value={minConfidence} onChange={(event) => setMinConfidence(Number(event.target.value))} />
        </label>
      </div>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-[560px] w-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {path.length > 1 ? <Polyline positions={path} pathOptions={{ color: "#d6a84f", weight: 3, opacity: 0.75 }} /> : null}
        {filteredEvents.map((event) => (
          <Marker key={event.id} position={[event.latitude, event.longitude]} icon={markerIcon}>
            <Popup>
              <div className="min-w-64 text-[#071018]">
                <div className="font-semibold">{event.title}</div>
                <div className="mt-1 text-xs">{formatDate(event.timestamp)}</div>
                <p className="my-2 text-sm">{event.description}</p>
                <div className="grid gap-1 text-xs">
                  <span>Connected entities: {event.connected_entity_ids.join(", ") || "Not available"}</span>
                  <span>Case: {event.case_id}</span>
                  <span>Source: {unavailable(event.provenance_span_ids[0])}</span>
                  <span>Provenance: {event.provenance_span_ids.join(", ") || "Not available"}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <ClassificationBadge value="FACT" />
                  <Badge tone="blue">{event.connected_entity_ids.length} entities</Badge>
                  <Badge tone="amber">{pct(event.confidence)}</Badge>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <Badge tone="blue">{filteredEvents.length} mapped events</Badge>
        <Badge tone="amber">Movement sequence shown when multiple events match</Badge>
        <span>Map markers are evidence-linked investigation records, not decorative pins.</span>
      </div>
    </div>
  );
}
