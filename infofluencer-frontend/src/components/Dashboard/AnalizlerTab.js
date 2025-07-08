import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// AnalizlerTab: Analytics dashboard için detaylı analizlerin gösterildiği ana sekme.

/**
 * AnalizlerTab componenti, kitle, trafik ve cihaz alt sekmelerini ve ilgili grafik/kartları içerir.
 */

const AnalizlerTab = ({
  connections,
  dashboardData,
  getTopN,
  barColors,
  BarLabel,
}) => {
  const audience = dashboardData.audience?.data;
  const traffic = dashboardData.traffic?.data;
  const note = dashboardData.audience?.note;
  const [subTab, setSubTab] = React.useState("kitle");

  if (!connections?.ga4 && !connections?.youtube) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-[#F97316] text-white rounded-xl px-6 py-5 flex items-center gap-3 shadow-md max-w-xl w-full">
          <span className="text-2xl">🔗</span>
          <div>
            <div className="font-bold text-lg mb-1">
              Analiz Hesaplarınız Bağlı Değil
            </div>
            <div className="text-sm">
              Kitle ve trafik analizlerini görebilmek için Google Analytics veya
              YouTube hesabınızı bağlayın.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (connections?.ga4 && !connections?.ga4_property_id) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-[#F97316] text-white rounded-xl px-6 py-5 flex items-center gap-3 shadow-md max-w-xl w-full">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-lg mb-1">GA4 Property ID Eksik</div>
            <div className="text-sm">
              Google Analytics 4 hesabınız bağlı ancak Property ID girilmemiş.
              Lütfen{" "}
              <a href="/analytics" className="underline font-semibold">
                Analytics Ayarları
              </a>{" "}
              sayfasından GA4 Property ID'nizi girin.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topTrafficSources = getTopN(
    traffic?.acquisition_channels,
    "sessions",
    10,
  );
  const topDevices = getTopN(
    traffic?.technology_breakdown?.devices,
    "users",
    10,
  );
  const topOS = getTopN(
    traffic?.technology_breakdown?.operating_systems,
    "users",
    10,
  );

  return (
    <div className="space-y-8">
      {note && (
        <div className="bg-[#F97316] text-white rounded-lg px-4 py-3 text-center font-medium flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">ℹ️</span>
          <span>{note}</span>
        </div>
      )}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setSubTab("kitle")}
          className={`px-6 py-2 rounded-lg font-semibold ${subTab === "kitle" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Kitle
        </button>
        <button
          onClick={() => setSubTab("trafik")}
          className={`px-6 py-2 rounded-lg font-semibold ${subTab === "trafik" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Trafik
        </button>
        <button
          onClick={() => setSubTab("cihaz")}
          className={`px-6 py-2 rounded-lg font-semibold ${subTab === "cihaz" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Cihaz
        </button>
      </div>
      {subTab === "kitle" && (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Kitle Analizi</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Yaş Dağılımı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-2">
              <h3 className="text-lg font-semibold mb-4">Yaş Dağılımı</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={audience?.age_distribution || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="age_group" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8B5CF6" name="Kullanıcı (%)" />
                  <Bar dataKey="sessions" fill="#F97316" name="Oturum (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Cinsiyet Dağılımı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center col-span-1">
              <h3 className="text-lg font-semibold mb-4">Cinsiyet Dağılımı</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={audience?.gender_distribution || []}
                    dataKey="sessions"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {(audience?.gender_distribution || []).map((entry, idx) => (
                      <Cell
                        key={`cell-gender-${idx}`}
                        fill={idx % 2 === 0 ? "#8B5CF6" : "#F97316"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Şehir Dağılımı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-1">
              <h3 className="text-lg font-semibold mb-4">Şehir Dağılımı</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Şehir</th>
                      <th className="px-3 py-2 text-right">Kullanıcı (%)</th>
                      <th className="px-3 py-2 text-right">Oturum (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(audience?.city_distribution || []).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-3 py-2">{row.city}</td>
                        <td className="px-3 py-2 text-right">{row.users}</td>
                        <td className="px-3 py-2 text-right">{row.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Ülke Dağılımı */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Ülke Dağılımı</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Ülke</th>
                    <th className="px-3 py-2 text-right">Kullanıcı (%)</th>
                    <th className="px-3 py-2 text-right">Oturum (%)</th>
                    <th className="px-3 py-2 text-right">Çıkış Oranı</th>
                  </tr>
                </thead>
                <tbody>
                  {(audience?.geographic_distribution || []).map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{row.country}</td>
                      <td className="px-3 py-2 text-right">{row.users}</td>
                      <td className="px-3 py-2 text-right">{row.sessions}</td>
                      <td className="px-3 py-2 text-right">
                        {row.bounce_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {subTab === "trafik" && (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Trafik Analizi</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trafik Kaynakları BarChart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">
                Trafik Kaynakları (İlk 10)
              </h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={topTrafficSources}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="source" type="category" width={120} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="sessions" fill="#8B5CF6" label={<BarLabel />}>
                    {topTrafficSources.map((entry, idx) => (
                      <Cell
                        key={`cell-traffic-bar-${idx}`}
                        fill={barColors[idx % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend (renkli dot ve isim) */}
              <div className="flex flex-wrap gap-3 mt-4">
                {topTrafficSources.map((row, idx) => (
                  <span
                    key={row.source}
                    className="flex items-center text-sm mr-4"
                  >
                    <span
                      style={{
                        backgroundColor: barColors[idx % barColors.length],
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        display: "inline-block",
                        marginRight: 6,
                      }}
                    ></span>
                    {row.source}
                  </span>
                ))}
              </div>
            </div>
            {/* Oturum Kaynakları Tablosu (sade) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">
                Oturum Kaynakları (İlk 10)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Kaynak</th>
                      <th className="px-3 py-2 text-right">Oturum</th>
                      <th className="px-3 py-2 text-right">Dönüşüm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTopN(traffic?.session_sources, "sessions", 10).map(
                      (row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-3 py-2 flex items-center">
                            <span
                              style={{
                                backgroundColor:
                                  barColors[idx % barColors.length],
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                display: "inline-block",
                                marginRight: 6,
                              }}
                            ></span>
                            {row.source_medium}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.sessions}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.conversions}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      {subTab === "cihaz" && (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Cihaz Analizi</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cihaz Dağılımı BarChart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">
                Cihaz Dağılımı (İlk 10)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topDevices}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="users" fill="#8B5CF6" label={<BarLabel />}>
                    {topDevices.map((entry, idx) => (
                      <Cell
                        key={`cell-device-bar-${idx}`}
                        fill={barColors[idx % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4">
                {topDevices.map((row, idx) => (
                  <span
                    key={row.category}
                    className="flex items-center text-sm mr-4"
                  >
                    <span
                      style={{
                        backgroundColor: barColors[idx % barColors.length],
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        display: "inline-block",
                        marginRight: 6,
                      }}
                    ></span>
                    {row.category}
                  </span>
                ))}
              </div>
            </div>
            {/* İşletim Sistemi BarChart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">
                İşletim Sistemi (İlk 10)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topOS}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="os" type="category" width={120} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="users" fill="#F97316" label={<BarLabel />}>
                    {topOS.map((entry, idx) => (
                      <Cell
                        key={`cell-os-bar-${idx}`}
                        fill={barColors[idx % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4">
                {topOS.map((row, idx) => (
                  <span key={row.os} className="flex items-center text-sm mr-4">
                    <span
                      style={{
                        backgroundColor: barColors[idx % barColors.length],
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        display: "inline-block",
                        marginRight: 6,
                      }}
                    ></span>
                    {row.os}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalizlerTab;
