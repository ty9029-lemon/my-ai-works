"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchAddress } from "@/lib/location/api-client";
import type { LocationSearchResult } from "@/lib/location/types";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: LocationSearchResult[] }
  | { status: "error" };

interface SearchSectionProps {
  onSelect: (result: LocationSearchResult) => void;
}

/** 검색 결과 목록. 0건이면 안내 문구, 실패하면 다시 시도 버튼을 보여 준다. */
function SearchResults({ state, onSelect, onRetry }: { state: SearchState; onSelect: SearchSectionProps["onSelect"]; onRetry: () => void }) {
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p className="text-sm text-danger">검색에 실패했어요. 잠시 후 다시 시도해 주세요.</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>다시 시도</Button>
      </div>
    );
  }
  if (state.status !== "done") return null;
  if (state.results.length === 0) {
    return <p className="text-sm text-muted-foreground">검색 결과가 없어요. 다른 이름으로 검색해 보세요.</p>;
  }
  return (
    <ul aria-label="검색 결과" className="flex flex-col gap-2">
      {state.results.map((result) => (
        <li key={`${result.latitude},${result.longitude},${result.label}`}>
          <Button variant="outline" size="lg" className="h-auto w-full justify-start py-2 text-left whitespace-normal" onClick={() => onSelect(result)}>
            {result.label}
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** 주소·지명 검색 입력과 결과. 빈 입력(공백만 포함)이면 검색 버튼이 비활성화된다. */
export function SearchSection({ onSelect }: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const trimmed = query.trim();
  const loading = state.status === "loading";

  async function runSearch() {
    if (trimmed === "") return;
    setState({ status: "loading" });
    try {
      setState({ status: "done", results: await searchAddress(trimmed) });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <section aria-labelledby="location-search" className="flex flex-col gap-3">
      <h2 id="location-search" className="text-base font-medium">주소로 찾기</h2>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch();
        }}
      >
        <Label htmlFor="location-query" className="text-sm">주소 또는 지명</Label>
        <div className="flex gap-2">
          <Input id="location-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예: 합정동, 서울시청" autoComplete="off" />
          <Button type="submit" disabled={trimmed === "" || loading}>
            <Search data-icon="inline-start" aria-hidden />
            {loading ? "검색 중..." : "검색"}
          </Button>
        </div>
      </form>
      <SearchResults state={state} onSelect={onSelect} onRetry={runSearch} />
    </section>
  );
}
