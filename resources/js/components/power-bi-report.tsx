import { useEffect, useRef, useState } from 'react';
import { models, Report } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';

export default function PowerBiReport({ title = 'Power BI report' }: { title?: string }) {
    const reportRef = useRef<Report | null>(null);
    const [config, setConfig] = useState<models.IReportEmbedConfiguration | null>(null);
    const [message, setMessage] = useState('Loading Power BI report…');

    useEffect(() => {
        fetch(route('power-bi.embed-config'), { headers: { Accept: 'application/json' } })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error((await response.json()).message || 'Power BI is not configured.');
                }

                return response.json();
            })
            .then((data) => {
                setConfig({
                    type: 'report',
                    id: data.reportId,
                    embedUrl: data.embedUrl,
                    accessToken: data.accessToken,
                    tokenType: models.TokenType.Embed,
                    permissions: models.Permissions.Read,
                    pageView: 'fitToWidth',
                    settings: { panes: { filters: { visible: false } } },
                });
            })
            .catch((error: Error) => setMessage(error.message));
    }, []);

    if (!config) {
        return <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-[#d0d5dd] bg-[#fbfcfe] p-6 text-center text-sm text-[#667085]">{message}</div>;
    }

    return (
        <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white">
            <div className="border-b border-[#eaecf0] px-5 py-4 text-sm font-semibold text-[#101828]">{title}</div>
            <PowerBIEmbed
                embedConfig={config}
                eventHandlers={new Map([
                    ['loaded', () => setMessage('')],
                    ['error', (event) => setMessage(event?.detail?.message || 'Power BI report failed to load.')],
                ])}
                getEmbeddedComponent={(embeddedReport) => {
                    reportRef.current = embeddedReport as Report;
                }}
                cssClassName="h-[560px] w-full"
            />
        </section>
    );
}
