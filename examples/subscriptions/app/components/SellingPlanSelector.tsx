import type {
  ProductFragment,
  SellingPlanGroupFragment,
  SellingPlanFragment,
} from 'storefrontapi.generated';
import {useMemo} from 'react';
import {useLocation} from '@remix-run/react';

/* Enriched sellingPlan type including isSelected and url */
export type SellingPlan = SellingPlanFragment & {
  isSelected: boolean;
  url: string;
};

/* Enriched sellingPlanGroup type including enriched SellingPlan nodes */
export type SellingPlanGroup = Omit<
  SellingPlanGroupFragment,
  'sellingPlans'
> & {
  sellingPlans: {
    nodes: SellingPlan[];
  };
};

/**
 * A component that simplifies selecting sellingPlans subscription options
 * @example Example use
 * ```ts
 *   <SellingPlanSelector
 *     sellingPlanGroups={sellingPlanGroups}
 *     selectedSellingPlanId={selectedSellingPlanId}
 *   >
 *     {({sellingPlanGroup}) => ( ...your sellingPlanGroup component )}
 *  </SellingPlanSelector>
 *  ```
 **/
export function SellingPlanSelector({
  sellingPlanGroups,
  selectedSellingPlanId,
  children,
  paramKey = 'selling_plan',
}: {
  sellingPlanGroups: ProductFragment['sellingPlanGroups'];
  selectedSellingPlanId: string | null;
  paramKey?: string;
  children: ({
    sellingPlanGroup,
  }: {
    sellingPlanGroup: SellingPlanGroup;
    selectedSellingPlanId: string | null;
  }) => React.ReactNode;
}) {
  const {search, pathname} = useLocation();
  const params = new URLSearchParams(search);

  return useMemo(
    () =>
      // @ts-ignore
      sellingPlanGroups.nodes.map((sellingPlanGroup: SellingPlanGroup) => {
        // Augmnet each sellingPlan node with isSelected and url
        const sellingPlans = sellingPlanGroup.sellingPlans.nodes
          .map((sellingPlan) => {
            if (!sellingPlan?.id) {
              // @ts-ignore
              console.warn(
                'SellingPlanSelector: sellingPlan.id is missing in the product query',
              );
              return null;
            }
            if (!sellingPlan.id) return null;
            params.set(paramKey, sellingPlan.id);
            sellingPlan.isSelected = selectedSellingPlanId === sellingPlan.id;
            sellingPlan.url = `${pathname}?${params.toString()}`;
            return sellingPlan as SellingPlan;
          })
          .filter(Boolean);
        sellingPlanGroup.sellingPlans.nodes = sellingPlans;
        return children({sellingPlanGroup, selectedSellingPlanId});
      }),
    [sellingPlanGroups],
  );
}
