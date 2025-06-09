import React from "react";
import {
  Typography,
  Card,
  CardBody,
  Button,
} from "../../components/MaterialTailwindFix";

export function TestCases() {
  // This would typically fetch test cases from an API
  const testCases: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h4">Test Cases</Typography>

        <Button color="blue" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Test Case
        </Button>
      </div>

      {testCases.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {testCases.map((testCase) => (
            <Card key={testCase.id}>
              <CardBody>
                <div className="flex justify-between">
                  <div>
                    <Typography variant="h5">{testCase.title}</Typography>
                    <Typography variant="small" color="gray">
                      {testCase.description || "No description"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="text" size="sm">
                      View
                    </Button>
                    <Button variant="text" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-50 p-4 text-blue-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <Typography variant="h6" className="mb-2">
              No Test Cases Found
            </Typography>
            <Typography className="text-center mb-6" color="gray">
              You haven't created any test cases yet. Get started by creating
              your first test case.
            </Typography>
            <Button color="blue" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Test Case
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
