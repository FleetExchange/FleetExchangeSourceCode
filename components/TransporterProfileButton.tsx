import { User, X } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TransporterProfileInfo from "./TransporterProfileInfo";
import TransporterProfileFiles from "./TransporterProfileFiles";

type Props = {
  id: Id<"users">;
};

const TransporterProfileButton = ({ id }: Props) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const user = useQuery(api.users.getUserById, { userId: id });

  return (
    <>
      <button
        className="btn btn-outline btn-sm gap-2"
        onClick={() => setOpen(true)}
      >
        <User className="w-4 h-4" />
        View Profile
      </button>

      {/* Modal */}
      <div
        className={`modal ${open ? "modal-open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-box max-w-md">
          <div className="flex items-start justify-between gap-4">
            <button
              className="btn btn-ghost btn-sm"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {user === undefined && (
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <span className="loading loading-spinner loading-xs" />
                Loading...
              </div>
            )}

            {user === null && (
              <div className="alert alert-warning">
                <span>User not found.</span>
              </div>
            )}

            {user && (
              <>
                <div className="p-4 lg:p-6">
                  <div className="w-full max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                              Transporter Profile
                            </h1>
                            <p className="text-base-content/60 mt-2">
                              View transporter information and business
                              documents
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section - Stacked Layout */}
                    <div className="space-y-6">
                      {/* Profile Info Section */}
                      <div>
                        <TransporterProfileInfo transporterId={id} />
                      </div>

                      {/* Files Section */}
                      <div>
                        <TransporterProfileFiles transporterId={id} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setOpen(false)} />
      </div>
    </>
  );
};

export default TransporterProfileButton;
