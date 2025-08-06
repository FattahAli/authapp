"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { Gender } from "@/types";
import PublicRoute from "@/components/auth/PublicRoute";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  age: z
    .number()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  profilePicture: z.instanceof(File).optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("profilePicture", file);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError("");

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("name", data.name);
      formData.append("age", data.age.toString());
      formData.append("gender", data.gender);

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      await signup(formData);
      toast.success("Account created successfully!");
      router.push("/users");
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Or{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Sign Up</CardTitle>
              <CardDescription className="text-slate-400">
                Create a new account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    {...register("age", { valueAsNumber: true })}
                    className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                      errors.age ? "border-red-500" : ""
                    }`}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-400">{errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">
                    Gender
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("gender", value as Gender)
                    }
                  >
                    <SelectTrigger
                      className={`bg-slate-700 border-slate-600 text-white ${
                        errors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem
                        value={Gender.MALE}
                        className="text-white hover:bg-slate-600"
                      >
                        Male
                      </SelectItem>
                      <SelectItem
                        value={Gender.FEMALE}
                        className="text-white hover:bg-slate-600"
                      >
                        Female
                      </SelectItem>
                      <SelectItem
                        value={Gender.OTHER}
                        className="text-white hover:bg-slate-600"
                      >
                        Other
                      </SelectItem>
                      <SelectItem
                        value={Gender.PREFER_NOT_TO_SAY}
                        className="text-white hover:bg-slate-600"
                      >
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-white">
                    Profile Picture (Optional)
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`bg-slate-700 border-slate-600 text-white ${
                      errors.profilePicture ? "border-red-500" : ""
                    }`}
                  />
                  {errors.profilePicture && (
                    <p className="text-sm text-red-400">
                      {errors.profilePicture.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
