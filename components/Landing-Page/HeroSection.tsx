"use client";

import useSWR from "swr";
import { BlogResponse, LandingResponse } from "./Hero/types-hero";
import { API_ENDPOINTS, EMPTY_STATE_MESSAGES } from "@/constants/hero";
import { fetcher } from "@/lib/hero";
import {
  FeaturedStorySkeleton,
  MatchCardSkeleton,
  PlayerListSkeleton,
} from "./Hero/skeletons";
import { ErrorDisplay } from "./Hero/ErrorDisplay";
import { FeaturedStory } from "./Hero/FeaturedStory";
import { PlayerList } from "./Hero/PlayerList";
import { MatchCard } from "./Hero/MatchCard";

const HeroSection = () => {
  const {
    data: blogData,
    error: blogError,
    isLoading: blogLoading,
  } = useSWR<BlogResponse>(API_ENDPOINTS.BLOGS_HOME, fetcher);

  const {
    data: landingData,
    error: landingError,
    isLoading: landingLoading,
  } = useSWR<LandingResponse>(API_ENDPOINTS.LANDING, fetcher);

  const blog = blogData?.data;
  const latestMatch = landingData?.latestMatch;
  const topScorers = landingData?.topScorers || [];
  const topAssisters = landingData?.topAssisters || [];

  return (
    <section className="w-full bg-[#06182e] pt-20 sm:pt-28 px-4" data-scroll>
      {/* SEO Content */}
      <div className="sr-only">
        <h2>Manchester City News and Fan Community</h2>
        <p>
          The City Crew brings you the latest Manchester City news, matchday
          coverage, blogs, player statistics, polls, and everything happening
          around Manchester City Football Club.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Story */}
        {blogLoading ? (
          <FeaturedStorySkeleton />
        ) : blogError ? (
          <div className="lg:col-span-2">
            <ErrorDisplay message="Failed to load featured story" />
          </div>
        ) : blog ? (
          <FeaturedStory blog={blog} />
        ) : null}

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Latest Match Card */}
          {landingLoading ? (
            <MatchCardSkeleton />
          ) : landingError ? (
            <ErrorDisplay message="Failed to load match data" />
          ) : latestMatch ? (
            <MatchCard match={latestMatch} />
          ) : null}

          {/* Top Scorers */}
          {landingLoading ? (
            <PlayerListSkeleton />
          ) : landingError ? null : (
            <PlayerList
              title="Top Scorers"
              players={topScorers}
              stat="goals"
              emptyMessage={EMPTY_STATE_MESSAGES.NO_GOALS}
            />
          )}

          {/* Top Assists */}
          {landingLoading ? (
            <PlayerListSkeleton />
          ) : landingError ? null : (
            <PlayerList
              title="Top Assists"
              players={topAssisters}
              stat="assists"
              emptyMessage={EMPTY_STATE_MESSAGES.NO_ASSISTS}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
