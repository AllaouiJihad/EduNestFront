import {SchoolCompareDTO} from "./school-compare-dto";

export interface SchoolComparisonResponse {
  schools: SchoolCompareDTO[];
  comparisonMatrix: Record<string, string[]>;
}
