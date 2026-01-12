import React from "react";
import { PageHeader, SectionHeader } from "@/components/primitives";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/icons";

/**
 * Demo page to showcase the header primitives
 * Path: /demo/headers (for development testing)
 */
const HeaderPrimitivesDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header Demo */}
        <section className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">PageHeader Examples</h1>

          {/* Example 1: Full PageHeader */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 1: Full PageHeader (with icon, breadcrumbs, subtitle, actions)
            </h2>
            <PageHeader
              title="Bill Manager"
              subtitle="Manage your scheduled expenses"
              icon="Receipt"
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Bills" },
              ]}
              actions={
                <>
                  <Button variant="secondary" size="sm">
                    {React.createElement(getIcon("Search"), { className: "h-4 w-4" })}
                    Search
                  </Button>
                  <Button variant="primary" size="sm">
                    {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
                    Add Bill
                  </Button>
                </>
              }
            />
          </div>

          {/* Example 2: Simple PageHeader */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 2: Simple PageHeader (title only)
            </h2>
            <PageHeader title="Analytics Dashboard" />
          </div>

          {/* Example 3: PageHeader with icon and subtitle */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 3: PageHeader with icon and subtitle
            </h2>
            <PageHeader
              title="Transaction History"
              subtitle="View all your financial transactions"
              icon="History"
            />
          </div>

          {/* Example 4: PageHeader with actions only */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 4: PageHeader with actions only
            </h2>
            <PageHeader
              title="Settings"
              actions={
                <>
                  <Button variant="secondary" size="sm">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm">
                    Save
                  </Button>
                </>
              }
            />
          </div>
        </section>

        {/* Section Header Demo */}
        <section className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">SectionHeader Examples</h1>

          {/* Example 1: Full SectionHeader */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 1: SectionHeader with count and actions
            </h2>
            <SectionHeader
              title="Upcoming Bills"
              count={5}
              actions={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <div className="text-sm text-slate-600">Content would go here...</div>
          </div>

          {/* Example 2: Simple SectionHeader */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 2: Simple SectionHeader (title only)
            </h2>
            <SectionHeader title="Recent Transactions" />
            <div className="text-sm text-slate-600">Content would go here...</div>
          </div>

          {/* Example 3: SectionHeader with count only */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 3: SectionHeader with count badge
            </h2>
            <SectionHeader title="Overdue Items" count={3} />
            <div className="text-sm text-slate-600">Content would go here...</div>
          </div>

          {/* Example 4: SectionHeader with zero count */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 4: SectionHeader with zero count
            </h2>
            <SectionHeader title="Active Subscriptions" count={0} />
            <div className="text-sm text-slate-600">No active subscriptions.</div>
          </div>

          {/* Example 5: SectionHeader with multiple actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-slate-600">
              Example 5: SectionHeader with multiple actions
            </h2>
            <SectionHeader
              title="Account Settings"
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    {React.createElement(getIcon("Edit"), { className: "h-4 w-4" })}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {React.createElement(getIcon("Trash2"), { className: "h-4 w-4" })}
                  </Button>
                </>
              }
            />
            <div className="text-sm text-slate-600">Content would go here...</div>
          </div>
        </section>

        {/* Usage in Real Context */}
        <section className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Real-World Usage Example</h1>

          <PageHeader
            title="Bill Manager"
            subtitle="Track and manage your recurring bills and payments"
            icon="FileText"
            breadcrumbs={[{ label: "Home", href: "/" }, { label: "Bills" }]}
            actions={
              <>
                <Button variant="secondary" size="sm">
                  {React.createElement(getIcon("Search"), { className: "h-4 w-4" })}
                  Discover Bills
                </Button>
                <Button variant="primary" size="sm">
                  {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
                  Add Bill
                </Button>
              </>
            }
          />

          <div className="mt-8 space-y-6">
            <SectionHeader
              title="Upcoming Bills"
              count={5}
              actions={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="font-semibold">Netflix</div>
                <div className="text-sm text-slate-600">Due: Jan 15</div>
                <div className="text-lg font-bold text-purple-600">$15.99</div>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="font-semibold">Internet</div>
                <div className="text-sm text-slate-600">Due: Jan 20</div>
                <div className="text-lg font-bold text-purple-600">$59.99</div>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="font-semibold">Phone</div>
                <div className="text-sm text-slate-600">Due: Jan 25</div>
                <div className="text-lg font-bold text-purple-600">$45.00</div>
              </div>
            </div>

            <SectionHeader
              title="Overdue Bills"
              count={2}
              actions={
                <Button variant="destructive" size="sm">
                  Pay All
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <div className="font-semibold">Electric</div>
                <div className="text-sm text-red-600">Overdue: 5 days</div>
                <div className="text-lg font-bold text-red-600">$120.50</div>
              </div>
              <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <div className="font-semibold">Water</div>
                <div className="text-sm text-red-600">Overdue: 3 days</div>
                <div className="text-lg font-bold text-red-600">$45.00</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeaderPrimitivesDemo;
