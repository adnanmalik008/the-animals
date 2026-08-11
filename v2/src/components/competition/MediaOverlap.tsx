import { isSharedByAll, mediaOverlap, overlapBrands } from "@/data/competition";

/* Static presence matrix. The pulsing "shared by all" cells are
   the only animation on this table — everything else holds still. */

export function MediaOverlap() {
  return (
    <div className="pt-4">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-3 pr-4 font-normal text-graphite">
                Outlet
              </th>
              {overlapBrands.map((brand) => (
                <th
                  key={brand.id}
                  scope="col"
                  className={`px-2 py-3 text-center ${
                    brand.id === "adidas" ? "font-bold text-orange" : "font-semibold"
                  }`}
                >
                  {brand.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mediaOverlap.map((row) => {
              const shared = isSharedByAll(row);
              return (
                <tr key={row.outlet} className="border-b border-line/70">
                  <th
                    scope="row"
                    className="whitespace-nowrap py-3.5 pr-4 text-left font-semibold"
                  >
                    {row.outlet}
                  </th>
                  {row.presence.map((present, i) => (
                    <td
                      key={overlapBrands[i].id}
                      className={`px-2 py-3.5 text-center ${
                        shared ? "cell-pulse bg-yellow/25" : ""
                      }`}
                    >
                      {present ? (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full bg-ink"
                          role="img"
                          aria-label={`${overlapBrands[i].name} appears in ${row.outlet}`}
                        />
                      ) : (
                        <span className="sr-only">
                          {overlapBrands[i].name} absent from {row.outlet}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-graphite">
        <span className="inline-block h-3 w-3 rounded-[3px] bg-yellow/50" aria-hidden />
        Shared by all
      </p>
    </div>
  );
}
